from datetime import time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.medication import Medication
from app.models.senior import Senior
from app.models.user import User
from app.schemas.medication import (
    MedicationCreate,
    MedicationOut,
    MedicationsListResponse,
    MedicationUpdate,
)

router = APIRouter(prefix="/medications", tags=["medications"])


def _parse_scheduled_time(value: str) -> time:
    parts = value.strip().split(":")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid time format. Use HH:MM",
        )
    try:
        hour, minute = int(parts[0]), int(parts[1])
        return time(hour=hour, minute=minute)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid time format. Use HH:MM",
        ) from exc


def _medication_to_out(med: Medication, senior: Senior | None) -> MedicationOut:
    senior_name = (
        f"{senior.first_name} {senior.last_name}" if senior else "Unknown"
    )
    return MedicationOut(
        id=med.id,
        senior_id=med.senior_id,
        senior_name=senior_name,
        medication_name=med.medication_name,
        dose=med.dose,
        scheduled_time=med.scheduled_time.strftime("%H:%M"),
        is_taken_today=med.is_taken_today,
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


async def _get_medication_for_caregiver(
    medication_id: int,
    db: AsyncSession,
    current_user: User,
) -> tuple[Medication, Senior | None]:
    result = await db.execute(
        select(Medication, Senior)
        .join(Senior, Medication.senior_id == Senior.id)
        .where(
            Medication.id == medication_id,
            Senior.caregiver_id == current_user.id,
        )
    )
    row = result.one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found",
        )
    return row[0], row[1]


@router.get("", response_model=MedicationsListResponse)
async def list_medications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationsListResponse:
    result = await db.execute(
        select(Medication, Senior)
        .join(Senior, Medication.senior_id == Senior.id)
        .where(Senior.caregiver_id == current_user.id)
        .order_by(Medication.scheduled_time, Senior.last_name, Senior.first_name)
    )
    rows = result.all()
    medications = [
        _medication_to_out(med, senior) for med, senior in rows
    ]
    return MedicationsListResponse(count=len(medications), medications=medications)


@router.get("/{medication_id}", response_model=MedicationOut)
async def get_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationOut:
    med, senior = await _get_medication_for_caregiver(
        medication_id, db, current_user
    )
    return _medication_to_out(med, senior)


@router.post("", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
async def create_medication(
    payload: MedicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationOut:
    senior = await _get_senior_for_caregiver(payload.senior_id, db, current_user)
    medication = Medication(
        senior_id=senior.id,
        medication_name=payload.medication_name.strip(),
        dose=payload.dose.strip(),
        scheduled_time=_parse_scheduled_time(payload.scheduled_time),
        is_taken_today=False,
    )
    db.add(medication)
    await db.commit()
    await db.refresh(medication)
    return _medication_to_out(medication, senior)


@router.patch("/{medication_id}", response_model=MedicationOut)
async def update_medication(
    medication_id: int,
    payload: MedicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationOut:
    med, senior = await _get_medication_for_caregiver(
        medication_id, db, current_user
    )

    if payload.senior_id is not None:
        senior = await _get_senior_for_caregiver(payload.senior_id, db, current_user)
        med.senior_id = senior.id

    if payload.medication_name is not None:
        med.medication_name = payload.medication_name.strip()
    if payload.dose is not None:
        med.dose = payload.dose.strip()
    if payload.scheduled_time is not None:
        med.scheduled_time = _parse_scheduled_time(payload.scheduled_time)
    if payload.is_taken_today is not None:
        med.is_taken_today = payload.is_taken_today

    await db.commit()
    await db.refresh(med)
    return _medication_to_out(med, senior)


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    med, _senior = await _get_medication_for_caregiver(
        medication_id, db, current_user
    )
    await db.delete(med)
    await db.commit()
