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
    MedicationUpdate,
    MedicationsListResponse,
)

router = APIRouter(prefix="/medications", tags=["medications"])


def _parse_time(value: str) -> time:
    parts = value.split(":")
    return time(int(parts[0]), int(parts[1]))


def _format_time(t: time) -> str:
    return t.strftime("%H:%M")


def _to_out(med: Medication, senior_name: str) -> MedicationOut:
    return MedicationOut(
        id=med.id,
        senior_id=med.senior_id,
        senior_name=senior_name,
        medication_name=med.medication_name,
        dose=med.dose,
        scheduled_time=_format_time(med.scheduled_time),
        is_taken_today=med.is_taken_today,
    )


async def _get_senior_for_user(
    senior_id: int, user_id: int, db: AsyncSession
) -> Senior:
    senior = await db.scalar(
        select(Senior).where(Senior.id == senior_id, Senior.caregiver_id == user_id)
    )
    if not senior:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Senior not found."
        )
    return senior


async def _get_medication_for_user(
    medication_id: int, user_id: int, db: AsyncSession
) -> tuple[Medication, Senior]:
    result = await db.execute(
        select(Medication, Senior)
        .join(Senior, Medication.senior_id == Senior.id)
        .where(Medication.id == medication_id, Senior.caregiver_id == user_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found."
        )
    return row.Medication, row.Senior


@router.get("", response_model=MedicationsListResponse)
async def list_medications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationsListResponse:
    result = await db.execute(
        select(Medication, Senior)
        .join(Senior, Medication.senior_id == Senior.id)
        .where(Senior.caregiver_id == current_user.id)
        .order_by(Medication.scheduled_time)
    )
    rows = result.all()
    medications = [
        _to_out(row.Medication, f"{row.Senior.first_name} {row.Senior.last_name}")
        for row in rows
    ]
    return MedicationsListResponse(count=len(medications), medications=medications)


@router.post("", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
async def create_medication(
    payload: MedicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationOut:
    senior = await _get_senior_for_user(payload.senior_id, current_user.id, db)
    med = Medication(
        senior_id=senior.id,
        medication_name=payload.medication_name.strip(),
        dose=payload.dose.strip(),
        scheduled_time=_parse_time(payload.scheduled_time),
        is_taken_today=False,
    )
    db.add(med)
    await db.commit()
    await db.refresh(med)
    return _to_out(med, f"{senior.first_name} {senior.last_name}")


@router.patch("/{medication_id}", response_model=MedicationOut)
async def update_medication(
    medication_id: int,
    payload: MedicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MedicationOut:
    med, senior = await _get_medication_for_user(medication_id, current_user.id, db)

    if payload.medication_name is not None:
        med.medication_name = payload.medication_name.strip()
    if payload.dose is not None:
        med.dose = payload.dose.strip()
    if payload.scheduled_time is not None:
        med.scheduled_time = _parse_time(payload.scheduled_time)
    if payload.is_taken_today is not None:
        med.is_taken_today = payload.is_taken_today

    await db.commit()
    await db.refresh(med)
    return _to_out(med, f"{senior.first_name} {senior.last_name}")


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    med, _ = await _get_medication_for_user(medication_id, current_user.id, db)
    await db.delete(med)
    await db.commit()
