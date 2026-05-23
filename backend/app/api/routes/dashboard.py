from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.call import Call
from app.models.medication import Medication
from app.models.senior import Senior
from app.models.user import User
from app.schemas.dashboard import (
    CircleMemberOut,
    DashboardResponse,
    DashboardStats,
    MedicationOut,
    RecentCallOut,
    SeniorOut,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _call_tone(call: Call) -> str:
    if call.health_flags and call.health_flags.strip():
        return "warning"
    if call.status in ("missed", "failed"):
        return "danger"
    return "success"


def _member_status(latest: Call | None) -> str:
    if latest is None:
        return "doing-well"
    if latest.health_flags and latest.health_flags.strip():
        return "needs-attention"
    if latest.status in ("missed", "failed"):
        return "missed-call"
    return "doing-well"


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
    senior_ids = list(senior_by_id.keys())

    if senior_ids:
        medications_result = await db.scalars(
            select(Medication)
            .where(Medication.senior_id.in_(senior_ids))
            .order_by(Medication.scheduled_time)
        )
        medications = medications_result.all()

        calls_result = await db.scalars(
            select(Call)
            .where(Call.caregiver_id == current_user.id)
            .order_by(Call.started_at.desc())
        )
        all_calls = calls_result.all()
    else:
        medications = []
        all_calls = []

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
    pending_count = len(medications) - taken_count

    now = datetime.now(UTC).replace(tzinfo=None)
    since_24h = now - timedelta(hours=24)
    since_7d = now - timedelta(days=7)

    calls_completed_24h = sum(
        1
        for c in all_calls
        if c.status == "completed" and c.started_at >= since_24h
    )

    flagged_recent = [
        c
        for c in all_calls
        if c.health_flags
        and c.health_flags.strip()
        and c.started_at >= since_7d
    ]
    active_alerts = len(flagged_recent) + pending_count

    latest_call_by_senior: dict[int, Call] = {}
    for call in all_calls:
        if call.senior_id not in latest_call_by_senior:
            latest_call_by_senior[call.senior_id] = call

    circle: list[CircleMemberOut] = []
    for senior in seniors:
        latest = latest_call_by_senior.get(senior.id)
        circle.append(
            CircleMemberOut(
                id=senior.id,
                first_name=senior.first_name,
                last_name=senior.last_name,
                age=senior.age,
                diagnoses=senior.diagnoses,
                last_call_at=latest.started_at if latest else None,
                status=_member_status(latest),
            )
        )

    recent_calls: list[RecentCallOut] = []
    for call in all_calls[:5]:
        senior = senior_by_id.get(call.senior_id)
        senior_name = (
            f"{senior.first_name} {senior.last_name}" if senior else "Unknown"
        )
        summary = (
            call.ai_summary
            or call.notes
            or "No summary recorded yet."
        )
        recent_calls.append(
            RecentCallOut(
                id=call.id,
                senior_name=senior_name,
                started_at=call.started_at,
                summary=summary,
                tone=_call_tone(call),
            )
        )

    return DashboardResponse(
        seniors=[SeniorOut.model_validate(s) for s in seniors],
        medications=medication_rows,
        circle=circle,
        recent_calls=recent_calls,
        stats=DashboardStats(
            senior_count=len(seniors),
            medications_taken=taken_count,
            medications_total=len(medications),
            calls_completed_24h=calls_completed_24h,
            active_alerts=active_alerts,
        ),
    )
