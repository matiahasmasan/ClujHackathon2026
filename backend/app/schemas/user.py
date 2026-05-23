from pydantic import BaseModel, ConfigDict


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: str | None = None


class UsersListResponse(BaseModel):
    message: str
    count: int
    users: list[UserPublic]
