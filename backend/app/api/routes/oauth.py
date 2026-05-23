"""OAuth routes for Better Auth integration."""

import base64
import json

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/oauth", tags=["oauth"])


@router.get("/google/login")
async def google_login():
    """Redirect user to Google OAuth login."""
    # Google OAuth parameters
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_oauth_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": "random_state_string",  # Should be random in production
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    redirect_url = f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"
    
    return {"redirect_url": redirect_url}


@router.get("/google/callback")
async def google_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle Google OAuth callback."""
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth not configured",
        )

    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_oauth_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )

            if token_response.status_code != 200:
                error_detail = token_response.json().get("error_description", "Failed to exchange code for token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=error_detail,
                )

            tokens = token_response.json()
            id_token = tokens.get("id_token")
            if not id_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No ID token received from Google",
                )

            parts = id_token.split(".")
            if len(parts) != 3:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid ID token format",
                )

            payload = parts[1]
            padding = 4 - len(payload) % 4
            if padding != 4:
                payload += "=" * padding

            decoded = json.loads(base64.urlsafe_b64decode(payload))
            email = decoded.get("email")
            google_id = decoded.get("sub")
            first_name = decoded.get("given_name", "")
            last_name = decoded.get("family_name", "")

            if not email or not google_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google account is missing required profile information",
                )

            user = await db.scalar(select(User).where(User.google_id == google_id))

            if user is None:
                user = await db.scalar(select(User).where(User.email == email))

            if user is None:
                user = User(
                    email=email,
                    google_id=google_id,
                    first_name=first_name or "User",
                    last_name=last_name or "",
                    password_hash="oauth",
                )
                db.add(user)
                try:
                    await db.commit()
                    await db.refresh(user)
                except IntegrityError:
                    await db.rollback()
                    user = await db.scalar(
                        select(User).where(User.google_id == google_id)
                    ) or await db.scalar(select(User).where(User.email == email))
                    if user is None:
                        raise
            elif user.google_id is None:
                user.google_id = google_id
                await db.commit()

            access_token = create_access_token(user_id=user.id, email=user.email)

            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "token": access_token,
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth failed: {str(e)}",
        ) from e
