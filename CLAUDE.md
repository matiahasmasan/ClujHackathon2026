# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare caregiver management app (Hackathon project) for managing seniors, medications, and AI-assisted call logs. Full-stack monorepo with separate `frontend/` and `backend/` directories.

## Commands

### Frontend (in `frontend/`)
```bash
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (in `backend/`)
```bash
uv run uvicorn app.main:app --reload --port 8000   # Start API server
```

Swagger docs available at `http://localhost:8000/docs`.

## Architecture

### Frontend — React 19 + Vite SPA

- **Routing**: React Router v7. Public routes: `/`, `/login`, `/signup`. Protected routes under `/dashboard/*` (layout guard in `src/components/layout/`).
- **Pages**: `src/pages/` — Landing, Login, SignUp, Dashboard, Seniors, Medications, Calls, Settings, NotFound.
- **API client**: `src/lib/api.js` — fetch-based with Bearer token auth. Token stored in localStorage.
- **Styling**: Tailwind CSS v4 with custom theme variables (primary blue `#017df0`, green `#25be5f`).
- **No global state library** — local React state + localStorage for auth token.
- **Components**: `src/components/ui/` for reusable primitives (Button, Input, Modal), `src/components/dashboard/` and `src/components/landing/` for page-specific components.

### Backend — FastAPI + SQLAlchemy async

- **Entry point**: `backend/app/main.py` — FastAPI app, CORS, router registration.
- **Config**: `backend/app/core/config.py` (pydantic-settings) reads from `.env`.
- **Database**: PostgreSQL on Neon via SQLAlchemy 2.0 async + asyncpg. Session setup in `backend/app/core/database.py`.
- **Auth**: JWT (PyJWT) + bcrypt password hashing (`backend/app/core/security.py`). Google OAuth also configured.
- **API routes** (`backend/app/api/routes/`): `auth`, `users`, `dashboard`, `seniors`, `medications`, `calls`, `pricing`, `health` — all mounted under `/api`.
- **Models** (`backend/app/models/`): `User`, `Senior`, `Medication`, `Call`, `PricingPlan`, `PricingPlanFeature` — SQLAlchemy ORM.
- **Schemas** (`backend/app/schemas/`): Pydantic request/response models.

### Data model summary
- A `User` (caregiver) manages many `Senior` profiles.
- Each `Senior` has `Medication` records (with scheduled times) and `Call` logs (with AI summaries and health flags).
- `PricingPlan` + `PricingPlanFeature` are used on the landing/pricing page.

## Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_GOOGLE_CLIENT_ID=...
VITE_API_URL=http://localhost:8000/api   # optional, this is the default
```

**Backend** (`backend/.env`, see `backend/.env.example`):
```
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET_KEY=...           # min 32 chars
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
DEBUG=true
```

## Key Tech Versions
- Python 3.12 (see `backend/.python-version`)
- React 19, Vite 8, Tailwind CSS 4
- FastAPI 0.136, SQLAlchemy 2.0
