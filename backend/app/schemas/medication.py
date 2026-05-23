from pydantic import BaseModel, ConfigDict, Field


class MedicationCreate(BaseModel):
    senior_id: int
    medication_name: str = Field(..., min_length=1, max_length=100)
    dose: str = Field(..., min_length=1, max_length=50)
    scheduled_time: str = Field(..., min_length=4, max_length=5)


class MedicationUpdate(BaseModel):
    senior_id: int | None = None
    medication_name: str | None = Field(None, min_length=1, max_length=100)
    dose: str | None = Field(None, min_length=1, max_length=50)
    scheduled_time: str | None = Field(None, min_length=4, max_length=5)
    is_taken_today: bool | None = None


class MedicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    senior_id: int | None
    senior_name: str
    medication_name: str
    dose: str
    scheduled_time: str
    is_taken_today: bool


class MedicationsListResponse(BaseModel):
    count: int
    medications: list[MedicationOut]
