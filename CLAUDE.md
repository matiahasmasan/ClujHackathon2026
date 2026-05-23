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

Swagger docs available at `http://localhost:8000/docs`. No test suite exists in either frontend or backend.

## Architecture

### Frontend — React 19 + Vite SPA

- **Routing**: React Router v7. Public: `/`, `/login`, `/signup`. Protected under `/dashboard/*` (RequireAuth guard). Admin under `/admin/*` (RequireAdmin guard) with nested `/admin/pricing`.
- **Auth guards** (`src/components/auth/`): `RequireAuth` redirects unauthenticated users to `/login` and **redirects admins to `/admin`**. `RequireAdmin` redirects non-admins to `/dashboard`.
- **Auth state** (`src/lib/auth.js`): `localStorage.access_token` (JWT) + `localStorage.user` (JSON). Exports `isAuthenticated()`, `getStoredUser()`, `saveUser()`, `clearAuth()`, `getInitials()`, `maskEmail()`.
- **API client** (`src/lib/api.js`): fetch-based, reads Bearer token from localStorage. Base URL defaults to `http://localhost:8000/api` or `VITE_API_URL`. Extracts `detail` field from FastAPI error responses.
- **Dashboard refresh**: `DashboardPage` reads `seniorsVersion` from `useOutletContext()` on the parent layout to trigger refetch when seniors change — increment this counter to force a dashboard reload.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Primary blue `#017df0`, green `#25be5f`. No component library — all UI is custom.
- **Components**: `src/components/ui/` for primitives, `src/components/dashboard/`, `src/components/admin/`, `src/components/auth/`, `src/components/landing/`.
- **Pages**: Landing, Login, SignUp, Dashboard, Seniors, Medications, Calls, Ledger, Settings, AdminUsers, AdminPricing, NotFound.

### Backend — FastAPI + SQLAlchemy async

- **Entry point**: `backend/app/main.py` — mounts all 8 routers under `/api`, configures CORSMiddleware for localhost:5173.
- **Config**: `backend/app/core/config.py` (pydantic-settings). Required: `DATABASE_URL`, `JWT_SECRET_KEY` (min 32 chars). Optional: `GOOGLE_CLIENT_ID`, `DEBUG`, `CORS_ORIGINS`.
- **Database**: PostgreSQL via SQLAlchemy 2.0 async + asyncpg. `get_db()` dependency in `backend/app/api/deps.py` yields `AsyncSession` with `expire_on_commit=False`.
- **Auth dependency** (`backend/app/api/deps.py`): `get_current_user()` extracts user from `Authorization: Bearer <JWT>`, decodes with HS256, fetches User from DB. Raises 401 on invalid/expired token.
- **Admin authorization**: Routes in `users.py` and `pricing.py` call a `_require_admin(current_user)` helper that checks `current_user.role == "admin"`, raises 403 otherwise.
- **JWT**: HS256, `sub` = user_id (str), `email`, expires in 60 minutes. Created and validated in `backend/app/core/security.py`.
- **Google OAuth** (`/api/auth/google`): Validates Google ID token via `google.oauth2.id_token.verify_oauth2_token()`, then finds or auto-creates a User with a random unusable password.
- **API routes** (`backend/app/api/routes/`): `auth` (register, login, google, me), `users` (admin CRUD), `dashboard` (aggregate stats + recent data), `seniors`, `medications`, `calls`, `pricing`, `health`.
- **Models** (`backend/app/models/`): `User` (role nullable, "admin" for admins), `Senior` (caregiver_id FK), `Medication` (senior_id + caregiver_id FKs, `is_taken_today` bool), `Call` (ai_summary, health_flags Text fields), `PricingPlan`, `PricingPlanFeature` (features loaded via `lazy="selectin"`).
- **Schemas** (`backend/app/schemas/`): Pydantic request/response models per resource.

### Data model summary
- A `User` (caregiver) manages many `Senior` profiles.
- Each `Senior` has `Medication` records (scheduled times, daily adherence flag) and `Call` logs (AI summaries, health flags).
- `PricingPlan` + `PricingPlanFeature` are used on the landing/pricing page (public read, admin write).

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

If Neon RLS is enabled on seniors/medications tables, dev SQL policies are required — see `.env.example` notes.

## Key Tech Versions
- Python 3.12 (see `backend/.python-version`)
- React 19, Vite 8, Tailwind CSS 4
- FastAPI 0.136, SQLAlchemy 2.0
