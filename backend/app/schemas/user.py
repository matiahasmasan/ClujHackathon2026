from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: str | None = None
    role: str | None = None
    created_at: datetime | None = None


class UsersListResponse(BaseModel):
    message: str
    count: int
    users: list[UserPublic]


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str | None = None
    role: str = "caregiver"


class UserAdminUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    role: str | None = None
