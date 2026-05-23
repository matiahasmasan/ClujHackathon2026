from pydantic import BaseModel, ConfigDict


class SeniorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    age: int
    gender: str
    diagnoses: str | None = None


class MedicationOut(BaseModel):
    id: int
    senior_id: int | None
    senior_name: str
    medication_name: str
    dose: str
    scheduled_time: str
    is_taken_today: bool


class DashboardStats(BaseModel):
    senior_count: int
    medications_taken: int
    medications_total: int


class DashboardResponse(BaseModel):
    seniors: list[SeniorOut]
    medications: list[MedicationOut]
    stats: DashboardStats
