import json
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # General
    app_name: str = "ClujHackathon2026 API"
    debug: bool = True

    # CORS — origins allowed to call the API (the Vite dev server by default).
    # Accepts either a JSON list (e.g. '["https://foo.com"]') or a plain
    # comma-separated string (e.g. 'https://foo.com,https://bar.com') so the
    # value is easy to paste into hosting dashboards like Render or Vercel.
    # `NoDecode` disables pydantic-settings' automatic JSON parsing so the raw
    # env string reaches the validator below intact.
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Optional regex matched against the Origin header. Use it to allow Vercel
    # preview deployments without listing every random subdomain, e.g.
    # CORS_ORIGIN_REGEX=^https://cluj-hackathon2026(-[a-z0-9-]+)?\.vercel\.app$
    cors_origin_regex: str | None = None

    # Database — preia automat DATABASE_URL din .env.
    database_url: str

    # JWT — loaded from JWT_SECRET_KEY in .env (required).
    jwt_secret_key: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # Google Sign-In — OAuth 2.0 Client ID used to verify ID tokens sent from
    # the frontend. Loaded from GOOGLE_CLIENT_ID in .env.
    google_client_id: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        stripped = value.strip()
        if not stripped:
            return []
        if stripped.startswith("["):
            return json.loads(stripped)
        return [origin.strip() for origin in stripped.split(",") if origin.strip()]


settings = Settings()
