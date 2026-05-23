"""Two-Factor Authentication (2FA) utilities."""

import secrets
import qrcode
from io import BytesIO
import pyotp
from datetime import datetime, timedelta, UTC


class TwoFactorAuth:
    """Handle 2FA operations (TOTP)."""

    @staticmethod
    def generate_secret() -> str:
        """Generate a random secret for TOTP."""
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(secret: str, email: str, app_name: str = "ClujHackathon") -> str:
        """Get provisioning URI for scanning with authenticator app."""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(
            name=email,
            issuer_name=app_name,
        )

    @staticmethod
    def generate_qr_code(provisioning_uri: str) -> bytes:
        """Generate QR code as bytes."""
        qr = qrcode.QRCode()
        qr.add_data(provisioning_uri)
        qr.make()
        img = qr.make_image()
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()

    @staticmethod
    def verify_token(secret: str, token: str) -> bool:
        """Verify a TOTP token."""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)

    @staticmethod
    def generate_backup_codes(count: int = 10) -> list[str]:
        """Generate backup codes for account recovery."""
        return [secrets.token_hex(4) for _ in range(count)]
