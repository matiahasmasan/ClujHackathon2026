"""OAuth routes for Better Auth integration."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User

router = APIRouter(prefix="/oauth", tags=["oauth"])


@router.post("/google/callback")
async def google_callback(
    id_token: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle Google OAuth callback."""
    # In production, verify the id_token properly
    # For now, we'll accept it (should use google.auth.transport.requests)
    
    try:
        # Decode and validate id_token (simplified)
        import jwt
        from app.core.config import settings
        
        # This is simplified - in production use Google's token verification
        payload = jwt.decode(id_token, options={"verify_signature": False})
        
        email = payload.get("email")
        google_id = payload.get("sub")
        first_name = payload.get("given_name", "")
        last_name = payload.get("family_name", "")
        
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
                    password_hash="",  # No password for OAuth users
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


@router.post("/github/callback")
async def github_callback(
    code: str = Query(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle GitHub OAuth callback."""
    # In production, exchange code for access token and fetch user info
    # For now, simplified version
    
    try:
        # This would normally exchange code for token
        # and fetch user data from GitHub API
        
        # Placeholder - in production implement full flow
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth fully implemented in v2.0",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth failed: {str(e)}",
        )
