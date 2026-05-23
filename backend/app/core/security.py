import bcrypt


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt; returns the encoded hash string."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        # password_hash is not a valid bcrypt hash (e.g. legacy plaintext)
        return False
