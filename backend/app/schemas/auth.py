from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    first_name: str
    last_name: str


class GoogleLoginRequest(BaseModel):
    # The ID token (a JWT) returned by Google Identity Services on the frontend.
    credential: str


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: str | None = None
