from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    # CORS — origins allowed to call the API (the Vite dev server by default)
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database — preia automat DATABASE_URL din .env.
    database_url: str

    # JWT — loaded from JWT_SECRET_KEY in .env (required).
    jwt_secret_key: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # OAuth — Google
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # OAuth — GitHub
    github_client_id: str = ""
    github_client_secret: str = ""


settings = Settings()
