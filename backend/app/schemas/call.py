from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

CALL_STATUSES = ("initiated", "in_progress", "completed", "missed", "failed")


class CallCreate(BaseModel):
    senior_id: int
    notes: str | None = None
    status: str = Field(default="initiated", max_length=20)


class CallUpdate(BaseModel):
    status: str | None = Field(None, max_length=20)
    ended_at: datetime | None = None
    notes: str | None = None
    ai_summary: str | None = None
    health_flags: str | None = None


class CallOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    senior_id: int
    senior_name: str
    caregiver_id: int
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    status: str
    notes: str | None
    ai_summary: str | None
    health_flags: str | None
    created_at: datetime


class CallsListResponse(BaseModel):
    count: int
    calls: list[CallOut]
