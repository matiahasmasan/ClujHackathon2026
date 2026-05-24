from pydantic import BaseModel, ConfigDict, Field


class MedicationCreate(BaseModel):
    senior_id: int
    medication_name: str = Field(..., min_length=1, max_length=100)
    dose: str = Field(..., min_length=1, max_length=50)
    # Optional: when omitted, the medication is stored with a 00:00 time.
    scheduled_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    stock: int = Field(0, ge=0)


class MedicationUpdate(BaseModel):
    medication_name: str | None = Field(None, min_length=1, max_length=100)
    dose: str | None = Field(None, min_length=1, max_length=50)
    scheduled_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    is_taken_today: bool | None = None
    stock: int | None = Field(None, ge=0)


class MedicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    senior_id: int | None
    senior_name: str
    medication_name: str
    dose: str
    scheduled_time: str
    is_taken_today: bool
    stock: int


class MedicationsListResponse(BaseModel):
    count: int
    medications: list[MedicationOut]
