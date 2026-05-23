from datetime import datetime

from pydantic import BaseModel

from app.schemas.senior import SeniorOut


class MedicationOut(BaseModel):
    id: int
    senior_id: int | None
    senior_name: str
    medication_name: str
    dose: str
    scheduled_time: str
    is_taken_today: bool


class RecentCallOut(BaseModel):
    id: int
    senior_name: str
    started_at: datetime
    summary: str
    tone: str


class CircleMemberOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    age: int
    diagnoses: str | None
    last_call_at: datetime | None
    status: str


class DashboardStats(BaseModel):
    senior_count: int
    medications_taken: int
    medications_total: int
    calls_completed_24h: int
    active_alerts: int


class DashboardResponse(BaseModel):
    seniors: list[SeniorOut]
    medications: list[MedicationOut]
    circle: list[CircleMemberOut]
    recent_calls: list[RecentCallOut]
    stats: DashboardStats
