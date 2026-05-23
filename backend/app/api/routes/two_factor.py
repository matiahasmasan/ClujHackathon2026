"""Two-Factor Authentication routes for Better Auth integration."""

import json
import base64
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.two_factor import TwoFactorAuth
from app.models.user import User

router = APIRouter(prefix="/2fa", tags=["2fa"])


def get_current_user(token: str = None, db: AsyncSession = Depends(get_db)):
    """Get current authenticated user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided",
        )
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    return user_id


@router.post("/setup")
async def setup_2fa(
    token: str = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Setup 2FA for current user - returns QR code and secret."""
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Generate 2FA secret
    secret = TwoFactorAuth.generate_secret()
    provisioning_uri = TwoFactorAuth.get_provisioning_uri(secret, user.email)
    
    # Generate QR code
    qr_code_bytes = TwoFactorAuth.generate_qr_code(provisioning_uri)
    qr_code_b64 = base64.b64encode(qr_code_bytes).decode()
    
    # Generate backup codes
    backup_codes = TwoFactorAuth.generate_backup_codes()
    
    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_code_b64}",
        "backup_codes": backup_codes,
        "message": "Scan the QR code with your authenticator app and verify with a code",
    }


@router.post("/verify")
async def verify_2fa(
    token: str = Body(...),
    code: str = Body(...),
    secret: str = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Verify 2FA setup with a code."""
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Verify the code
    if not TwoFactorAuth.verify_token(secret, code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA code",
        )
    
    # Save 2FA configuration
    backup_codes = TwoFactorAuth.generate_backup_codes()
    user.two_factor_secret = secret
    user.two_factor_enabled = True
    user.backup_codes = json.dumps(backup_codes)
    
    await db.commit()
    
    return {
        "message": "2FA enabled successfully",
        "backup_codes": backup_codes,
    }


@router.post("/verify-login")
async def verify_login_2fa(
    email: str = Body(...),
    code: str = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Verify 2FA code during login."""
    user = await db.scalar(select(User).where(User.email == email))
    if not user or not user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not enabled for this user",
        )
    
    # Check against TOTP secret
    if user.two_factor_secret and TwoFactorAuth.verify_token(user.two_factor_secret, code):
        return {"verified": True}
    
    # Check against backup codes
    if user.backup_codes:
        try:
            backup_codes = json.loads(user.backup_codes)
            if code in backup_codes:
                backup_codes.remove(code)
                user.backup_codes = json.dumps(backup_codes)
                await db.commit()
                return {"verified": True, "backup_code_used": True}
        except json.JSONDecodeError:
            pass
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid 2FA code",
    )


@router.post("/disable")
async def disable_2fa(
    token: str = Body(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Disable 2FA for current user."""
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.two_factor_enabled = False
    user.two_factor_secret = None
    user.backup_codes = None
    await db.commit()
    
    return {"message": "2FA disabled successfully"}
