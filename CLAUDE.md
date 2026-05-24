# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**inTouch** — a hackathon caregiver-coordination app for managing seniors, medications, AI-assisted call logs, reviews, and (simulated) subscription billing. Full-stack monorepo with separate `frontend/` and `backend/` directories. No test suite exists in either.

## Commands

### Frontend (in `frontend/`)
```bash
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (in `backend/`)
```bash
uv run uvicorn app.main:app --reload --port 8000   # Start API server
```

Swagger docs at `http://localhost:8000/docs`. The backend is deployed via [render.yaml](backend/render.yaml).

## Architecture

### Frontend — React 19 + Vite SPA

- **Routing** ([App.jsx](frontend/src/App.jsx)): React Router v7. Public: `/`, `/login`, `/signup`, `/privacy`. Caregiver under `/dashboard/*` (`RequireAuth`): index, `seniors`, `medications`, `calls`, `settings`, `ledger`, `reviews`, `payments`, `subscriptions`, `checkout/:planId`. Admin under `/admin/*` (`RequireAdmin`): index (users), `pricing`, `reviews`, `payments`, `subscriptions`, `settings`. All non-landing routes are `lazy()`-imported.
- **Auth guards** ([src/components/auth/](frontend/src/components/auth/)): `RequireAuth` redirects unauthenticated users to `/login` and **redirects admins to `/admin`**. `RequireAdmin` redirects non-admins to `/dashboard`. Both mount `useSessionExpiry()` which schedules a one-shot logout at the JWT's `exp` time.
- **Auth state** ([src/lib/auth.js](frontend/src/lib/auth.js)): `localStorage.access_token` (JWT) + `localStorage.user` (JSON). Exports `isAuthenticated()`, `getStoredUser()`, `saveUser()`, `clearAuth()`, `getTokenExpiry()`, `getInitials()`, `maskEmail()`.
- **API client** ([src/lib/api.js](frontend/src/lib/api.js)): fetch-based, Bearer token from localStorage. Base URL: `VITE_API_URL` or `http://localhost:8000/api`. Any 401 response triggers `clearAuth()` + redirect to `/login`. Errors extract FastAPI's `detail` field (string or array of `{msg}`).
- **Dashboard refresh**: `DashboardPage` reads `seniorsVersion` from `useOutletContext()` on the parent layout — increment that counter to force a dashboard refetch after senior mutations.
- **Theme** ([src/lib/theme.js](frontend/src/lib/theme.js)): dark mode by toggling a `dark` class on `<html>`. Stored in `localStorage.theme`. Toggle UI in `DashboardSidebar`.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Primary blue `#017df0`, green `#25be5f`. No component library — all UI is custom.
- **Components**: `ui/` primitives; `layout/` (Navbar, Footer, AppBackground used by the landing page); `dashboard/`, `admin/`, `auth/`, `landing/`, `payments/`, `subscriptions/`.

### Care Ledger — client-side, tamper-evident log

[src/lib/ledger.js](frontend/src/lib/ledger.js) implements a hash-chained append-only log persisted to `localStorage["care_ledger"]`. Each entry stores a SHA-256 `hash` over `(id|createdAt|actor|action|JSON(payload)|prevHash)`; `verifyLedger()` recomputes the whole chain and reports the first broken entry. **It is entirely client-side and demo-only** — server-side persistence is on the roadmap. The Ledger page (`/dashboard/ledger`) exposes `seedLedger`, `tamperLedger`, and `clearLedger` for the demo.

### Backend — FastAPI + SQLAlchemy async

- **Entry point** ([backend/app/main.py](backend/app/main.py)): mounts **11 routers** under `/api` — `health`, `auth`, `users`, `dashboard`, `seniors`, `medications`, `calls`, `pricing`, `reviews`, `payments`, `subscriptions`. CORSMiddleware supports both an explicit `cors_origins` list and a `cors_origin_regex` (e.g. for Vercel preview deploys). `app.models` is imported for side-effect to register every ORM model before FK resolution.
- **Config** ([backend/app/core/config.py](backend/app/core/config.py)): pydantic-settings. Required: `DATABASE_URL`, `JWT_SECRET_KEY` (≥ 32 chars). Optional: `GOOGLE_CLIENT_ID`, `DEBUG`, `CORS_ORIGINS` (JSON list **or** comma-separated string — both are accepted), `CORS_ORIGIN_REGEX`.
- **Database**: PostgreSQL via SQLAlchemy 2.0 async + asyncpg. `get_db()` in [backend/app/api/deps.py](backend/app/api/deps.py) yields `AsyncSession` with `expire_on_commit=False`.
- **Auth dependency**: `get_current_user()` extracts the user from `Authorization: Bearer <JWT>`, decodes with HS256, loads the User row. Raises 401 on invalid/expired token.
- **Admin authorization**: each router that has admin endpoints defines its own `_require_admin(current_user)` helper (`users.py`, `pricing.py`, `reviews.py`, `payments.py`, `subscriptions.py`) — checks `current_user.role == "admin"`, raises 403 otherwise. If you add a new admin-only route, replicate that local helper rather than centralizing it.
- **JWT** ([backend/app/core/security.py](backend/app/core/security.py)): HS256, `sub` = user_id (str), `email` claim, 60-minute expiry.
- **Google OAuth** (`POST /api/auth/google`): verifies Google ID token via `google.oauth2.id_token.verify_oauth2_token()`, then finds or auto-creates a User with a random unusable password.
- **Stripe is simulated**, not real. `payments.py` mints fake IDs with `_fake_stripe_id()` and the `/payments/checkout` endpoint creates a subscription + a succeeded payment row inline — no Stripe API calls.

### Data model ([backend/app/models/](backend/app/models/))
- `User` (caregiver; `role` nullable, `"admin"` for admins) manages many `Senior` (caregiver_id FK).
- `Senior` has many `Medication` (senior_id + caregiver_id FKs, `is_taken_today` bool) and `Call` (`ai_summary`, `health_flags` as Text).
- `PricingPlan` + `PricingPlanFeature` — features loaded via `lazy="selectin"`. Public read on `/api/pricing`, admin-only write.
- `Subscription` — one-per-user (unique `user_id`), references a `PricingPlan`, stores Stripe-shaped fields (`stripe_customer_id`, `current_period_start/end`, `cancel_at_period_end`).
- `Payment` — references a user and optionally a subscription; `amount` in **minor units (cents) as Integer**, `status` defaults `"pending"`.
- `Review` — user-submitted rating + body; the landing page pulls one via `GET /api/reviews/featured` (public).

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
CORS_ORIGIN_REGEX=^https://.*\.vercel\.app$   # optional, for preview deploys
DEBUG=true
```

The Google client ID must be **identical** in both `.env` files. If Neon RLS is enabled on `seniors`/`medications`, dev SQL policies are required — see `.env.example` notes.

## Key Tech Versions
- Python 3.12 (see `backend/.python-version`), managed with `uv`
- FastAPI 0.136, SQLAlchemy 2.0 (async), asyncpg, PyJWT, bcrypt
- React 19, React Router 7, Vite 8, Tailwind CSS 4
