from pydantic import BaseModel, ConfigDict, Field


class SeniorCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    diagnoses: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=1, max_length=11)


class SeniorUpdate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    diagnoses: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=1, max_length=11)


class SeniorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    age: int
    gender: str
    diagnoses: str | None = None
    phone_number: str


class SeniorsListResponse(BaseModel):
    count: int
    seniors: list[SeniorOut]
