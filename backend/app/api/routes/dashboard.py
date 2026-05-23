from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.medication import Medication
from app.models.senior import Senior
from app.models.user import User
from app.schemas.dashboard import (
    DashboardResponse,
    DashboardStats,
    MedicationOut,
    SeniorOut,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    seniors_result = await db.scalars(
        select(Senior)
        .where(Senior.caregiver_id == current_user.id)
        .order_by(Senior.last_name, Senior.first_name)
    )
    seniors = seniors_result.all()
    senior_by_id = {s.id: s for s in seniors}

    if senior_by_id:
        medications_result = await db.scalars(
            select(Medication)
            .where(Medication.senior_id.in_(senior_by_id.keys()))
            .order_by(Medication.scheduled_time)
        )
        medications = medications_result.all()
    else:
        medications = []

    medication_rows: list[MedicationOut] = []
    for med in medications:
        senior = senior_by_id.get(med.senior_id) if med.senior_id else None
        senior_name = (
            f"{senior.first_name} {senior.last_name}" if senior else "Unknown"
        )
        medication_rows.append(
            MedicationOut(
                id=med.id,
                senior_id=med.senior_id,
                senior_name=senior_name,
                medication_name=med.medication_name,
                dose=med.dose,
                scheduled_time=med.scheduled_time.strftime("%H:%M"),
                is_taken_today=med.is_taken_today,
            )
        )

    taken_count = sum(1 for m in medications if m.is_taken_today)

    return DashboardResponse(
        seniors=[SeniorOut.model_validate(s) for s in seniors],
        medications=medication_rows,
        stats=DashboardStats(
            senior_count=len(seniors),
            medications_taken=taken_count,
            medications_total=len(medications),
        ),
    )
