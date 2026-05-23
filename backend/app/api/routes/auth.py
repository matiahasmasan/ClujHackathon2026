import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: RegisterRequest, db: AsyncSession = Depends(get_db)
) -> User:
    """Create a new user; the password is bcrypt-hashed before storage."""
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone_number=payload.phone_number,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest, db: AsyncSession = Depends(get_db)
) -> LoginResponse:
    """Authenticate a user by email + password (bcrypt-verified)."""
    user = await db.scalar(select(User).where(User.email == payload.email))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return LoginResponse(
        access_token=create_access_token(user_id=user.id, email=user.email),
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
    )


@router.post("/google", response_model=LoginResponse)
async def google_login(
    payload: GoogleLoginRequest, db: AsyncSession = Depends(get_db)
) -> LoginResponse:
    """Verify a Google ID token, find-or-create the user, and issue our JWT."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In is not configured on the server.",
        )

    # verify_oauth2_token checks the signature, expiry, issuer and that the
    # token was issued for OUR client id. It does a sync HTTP call to fetch
    # Google's certs, so run it off the event loop. Raises ValueError if invalid.
    try:
        claims = await run_in_threadpool(
            google_id_token.verify_oauth2_token,
            payload.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential.",
        )

    email = claims.get("email")
    if not email or not claims.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account has no verified email.",
        )

    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        # First time this Google user signs in: create an account. The password
        # column is NOT NULL, so store a random unusable hash — they log in via
        # Google, not email/password.
        user = User(
            first_name=claims.get("given_name") or email.split("@")[0],
            last_name=claims.get("family_name") or "",
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return LoginResponse(
        access_token=create_access_token(user_id=user.id, email=user.email),
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
    )
