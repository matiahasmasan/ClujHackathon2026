import secrets

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    """Validate credentials.

    Temporary: checks against the hardcoded admin/admin credentials from
    settings. To be replaced with a database-backed user lookup later.
    """
    valid_user = secrets.compare_digest(payload.username, settings.admin_username)
    valid_pass = secrets.compare_digest(payload.password, settings.admin_password)

    if not (valid_user and valid_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Placeholder token. Replace with a real signed JWT once auth is built out.
    return LoginResponse(
        access_token=secrets.token_urlsafe(32),
        username=payload.username,
    )
