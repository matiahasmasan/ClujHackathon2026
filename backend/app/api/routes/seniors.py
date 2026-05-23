from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.senior import Senior
from app.models.user import User
from app.schemas.senior import (
    SeniorCreate,
    SeniorOut,
    SeniorsListResponse,
    SeniorUpdate,
)

router = APIRouter(prefix="/seniors", tags=["seniors"])


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


@router.get("", response_model=SeniorsListResponse)
async def list_seniors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SeniorsListResponse:
    result = await db.scalars(
        select(Senior)
        .where(Senior.caregiver_id == current_user.id)
        .order_by(Senior.last_name, Senior.first_name)
    )
    seniors = result.all()
    return SeniorsListResponse(
        count=len(seniors),
        seniors=[SeniorOut.model_validate(s) for s in seniors],
    )


@router.get("/{senior_id}", response_model=SeniorOut)
async def get_senior(
    senior_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Senior:
    senior = await _get_senior_for_caregiver(senior_id, db, current_user)
    return senior


@router.post("", response_model=SeniorOut, status_code=status.HTTP_201_CREATED)
async def create_senior(
    payload: SeniorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Senior:
    senior = Senior(
        caregiver_id=current_user.id,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        age=payload.age,
        gender=payload.gender.strip(),
        diagnoses=payload.diagnoses.strip(),
        phone_number=payload.phone_number.strip(),
    )
    db.add(senior)
    await db.commit()
    await db.refresh(senior)
    return senior


@router.patch("/{senior_id}", response_model=SeniorOut)
async def update_senior(
    senior_id: int,
    payload: SeniorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Senior:
    senior = await _get_senior_for_caregiver(senior_id, db, current_user)
    senior.first_name = payload.first_name.strip()
    senior.last_name = payload.last_name.strip()
    senior.age = payload.age
    senior.gender = payload.gender.strip()
    senior.diagnoses = payload.diagnoses.strip()
    senior.phone_number = payload.phone_number.strip()
    await db.commit()
    await db.refresh(senior)
    return senior


@router.delete("/{senior_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_senior(
    senior_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    senior = await _get_senior_for_caregiver(senior_id, db, current_user)
    await db.delete(senior)
    await db.commit()
