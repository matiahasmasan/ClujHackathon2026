from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, calls, dashboard, health, medications, payments, pricing, reviews, seniors, subscriptions, users
from app.core.config import settings
import app.models  # noqa: F401 — register all ORM models for FK resolution

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All API routes are served under /api
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(seniors.router, prefix="/api")
app.include_router(medications.router, prefix="/api")
app.include_router(calls.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs"}
