from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.call import Call
from app.models.senior import Senior
from app.models.user import User
from app.schemas.call import (
    CALL_STATUSES,
    CallCreate,
    CallOut,
    CallsListResponse,
    CallUpdate,
)

router = APIRouter(prefix="/calls", tags=["calls"])


def _validate_status(value: str) -> str:
    normalized = value.strip().lower()
    if normalized not in CALL_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Use one of: {', '.join(CALL_STATUSES)}",
        )
    return normalized


def _call_to_out(call: Call, senior: Senior | None) -> CallOut:
    senior_name = (
        f"{senior.first_name} {senior.last_name}" if senior else "Unknown"
    )
    return CallOut(
        id=call.id,
        senior_id=call.senior_id,
        senior_name=senior_name,
        caregiver_id=call.caregiver_id,
        started_at=call.started_at,
        ended_at=call.ended_at,
        duration_seconds=call.duration_seconds,
        status=call.status,
        notes=call.notes,
        ai_summary=call.ai_summary,
        health_flags=call.health_flags,
        created_at=call.created_at,
    )


async def _get_senior_for_caregiver(
    senior_id: int,
    db: AsyncSession,
    current_user: User,
) -> Senior:
    senior = await db.get(Senior, senior_id)
    if senior is None or senior.caregiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Senior not found",
        )
    return senior


async def _get_call_for_caregiver(
    call_id: int,
    db: AsyncSession,
    current_user: User,
) -> tuple[Call, Senior | None]:
    result = await db.execute(
        select(Call, Senior)
        .join(Senior, Call.senior_id == Senior.id)
        .where(Call.id == call_id, Call.caregiver_id == current_user.id)
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found",
        )
    return row[0], row[1]


@router.get("", response_model=CallsListResponse)
async def list_calls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CallsListResponse:
    result = await db.execute(
        select(Call, Senior)
        .join(Senior, Call.senior_id == Senior.id)
        .where(Call.caregiver_id == current_user.id)
        .order_by(Call.started_at.desc())
    )
    rows = result.all()
    calls = [_call_to_out(call, senior) for call, senior in rows]
    return CallsListResponse(count=len(calls), calls=calls)


@router.get("/{call_id}", response_model=CallOut)
async def get_call(
    call_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CallOut:
    call, senior = await _get_call_for_caregiver(call_id, db, current_user)
    return _call_to_out(call, senior)


@router.post("", response_model=CallOut, status_code=status.HTTP_201_CREATED)
async def create_call(
    payload: CallCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CallOut:
    senior = await _get_senior_for_caregiver(payload.senior_id, db, current_user)
    call_status = _validate_status(payload.status)
    call = Call(
        senior_id=senior.id,
        caregiver_id=current_user.id,
        status=call_status,
        notes=payload.notes.strip() if payload.notes else None,
        started_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)
    return _call_to_out(call, senior)


@router.patch("/{call_id}", response_model=CallOut)
async def update_call(
    call_id: int,
    payload: CallUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CallOut:
    call, senior = await _get_call_for_caregiver(call_id, db, current_user)

    if payload.status is not None:
        call.status = _validate_status(payload.status)

    if payload.ended_at is not None:
        call.ended_at = payload.ended_at.replace(tzinfo=None)
    elif call.status == "completed" and call.ended_at is None:
        call.ended_at = datetime.now(UTC).replace(tzinfo=None)

    if payload.notes is not None:
        call.notes = payload.notes.strip() or None
    if payload.ai_summary is not None:
        call.ai_summary = payload.ai_summary.strip() or None
    if payload.health_flags is not None:
        call.health_flags = payload.health_flags.strip() or None

    await db.commit()
    await db.refresh(call)
    return _call_to_out(call, senior)


@router.delete("/{call_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_call(
    call_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    call, _senior = await _get_call_for_caregiver(call_id, db, current_user)
    await db.delete(call)
    await db.commit()
