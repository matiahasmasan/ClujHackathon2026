import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserResponse,
)
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

router = APIRouter(prefix="/auth", tags=["auth"])

def create_access_token(data: dict):
    return jwt.encode(data, JWT_SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)


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

    # Placeholder token. Replace with a real signed JWT once auth is built out.
    return LoginResponse(
        access_token=create_access_token({"user_id": user.id}),
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
    )
