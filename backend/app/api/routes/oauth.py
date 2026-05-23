"""OAuth routes for Better Auth integration."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import base64

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/oauth", tags=["oauth"])


@router.get("/google/login")
async def google_login():
    """Redirect user to Google OAuth login."""
    # Google OAuth parameters
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": "http://localhost:8000/api/oauth/google/callback",
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
    try:
        if not settings.google_client_id or not settings.google_client_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google OAuth not configured",
            )
        
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": "http://localhost:8000/api/oauth/google/callback",
                    "grant_type": "authorization_code",
                },
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange code for token",
                )
            
            tokens = token_response.json()
            
            # Decode ID token to get user info
            id_token = tokens.get("id_token")
            if id_token:
                # Split JWT to get payload (middle part)
                parts = id_token.split(".")
                if len(parts) == 3:
                    # Add padding if necessary
                    payload = parts[1]
                    padding = 4 - len(payload) % 4
                    if padding != 4:
                        payload += "=" * padding
                    
                    import json
                    decoded = json.loads(base64.urlsafe_b64decode(payload))
                    
                    email = decoded.get("email")
                    google_id = decoded.get("sub")
                    first_name = decoded.get("given_name", "")
                    last_name = decoded.get("family_name", "")
                    
                    # Find or create user
                    user = await db.scalar(select(User).where(User.google_id == google_id))
                    
                    if user is None:
                        # Check if user exists by email
                        user = await db.scalar(select(User).where(User.email == email))
                        if user is None:
                            # Create new user
                            user = User(
                                email=email,
                                google_id=google_id,
                                first_name=first_name,
                                last_name=last_name,
                                password_hash="oauth",  # OAuth users don't have password
                            )
                            db.add(user)
                            await db.commit()
                            await db.refresh(user)
                        else:
                            # Link Google account to existing user
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
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not authenticate with Google",
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth failed: {str(e)}",
        )


@router.get("/github/login")
async def github_login():
    """Redirect user to GitHub OAuth login."""
    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": "http://localhost:8000/api/oauth/github/callback",
        "scope": "user:email",
        "state": "random_state_string",
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    redirect_url = f"https://github.com/login/oauth/authorize?{query_string}"
    
    return {"redirect_url": redirect_url}


@router.get("/github/callback")
async def github_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle GitHub OAuth callback."""
    try:
        if not settings.github_client_id or not settings.github_client_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub OAuth not configured",
            )
        
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to exchange code for token",
                )
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No access token received",
                )
            
            # Get user info from GitHub
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user info",
                )
            
            github_user = user_response.json()
            github_id = str(github_user.get("id"))
            email = github_user.get("email")
            login = github_user.get("login", "")
            name = github_user.get("name", "").split(" ", 1)
            first_name = name[0] if name else login
            last_name = name[1] if len(name) > 1 else ""
            
            # Find or create user
            user = await db.scalar(select(User).where(User.github_id == github_id))
            
            if user is None:
                # Check if user exists by email
                if email:
                    user = await db.scalar(select(User).where(User.email == email))
                
                if user is None:
                    # Create new user
                    user = User(
                        email=email or f"github-{github_id}@example.com",
                        github_id=github_id,
                        first_name=first_name,
                        last_name=last_name,
                        password_hash="oauth",
                    )
                    db.add(user)
                    await db.commit()
                    await db.refresh(user)
                else:
                    # Link GitHub account to existing user
                    user.github_id = github_id
                    await db.commit()
            
            access_token_jwt = create_access_token(user_id=user.id, email=user.email)
            
            return {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "token": access_token_jwt,
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth failed: {str(e)}",
        )

