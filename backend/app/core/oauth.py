"""OAuth provider utilities for Better Auth integration."""

from typing import Optional
from urllib.parse import urlencode

from authlib.integrations.httpx_client import AsyncOAuth2Client
from authlib.integrations.starlette_client import OAuth

from app.core.config import settings

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)


async def get_oauth_client(provider: str):
    """Get OAuth client for a given provider."""
    return oauth.create_client(provider)
