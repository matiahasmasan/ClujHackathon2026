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
    ]

    # Database — preia automat DATABASE_URL din .env.
    database_url: str


settings = Settings()
