# inTouch — Connection is the best medicine

> A care-coordination platform that helps families and caregivers stay on top
> of an elderly loved one's day-to-day health — medications, wellness, and a
> tamper-evident record of everything that matters.

Built at **ClujHackathon 2026**.

---

## The Problem

Caring for an aging parent or relative is fragmented and stressful:

- **Medication chaos.** Seniors often take several medications a day on
  different schedules. Missed or doubled doses are common, and no one has a
  clear, shared picture of what was actually taken.
- **No single source of truth.** Information lives in phone calls, sticky
  notes, and the memory of whoever happened to be there. Families lack a
  reliable, shared view of how their loved one is doing.
- **Accountability gaps.** When multiple caregivers are involved, it's hard to
  know *who* did *what* and *when* — and care records can be edited or deleted
  after the fact, accidentally or not. In a health context, that lack of an
  immutable history is a real trust problem.
- **Distance and worry.** Family members who live far away have no easy way to
  get peace of mind without constant check-in calls.

## The Solution

**inTouch** gives every caregiver a single, secure dashboard to coordinate
elder care, with three ideas at its core:

1. **One shared care dashboard.** Each caregiver sees the seniors in their
   circle, their medication schedules, and at-a-glance stats — what's due,
   what's been taken, and how the day is going.
2. **A tamper-evident Care Ledger.** Every important care event (a medication
   administered, a diagnosis updated) is written to an append-only ledger where
   each entry is cryptographically chained to the previous one. Records cannot
   be silently edited or deleted — any tampering is instantly detectable. This
   brings blockchain-style integrity guarantees to sensitive medical history.
3. **Secure, frictionless access.** Email/password and Google Sign-In, JWT
   sessions, and a two-step verification flow — so the right people get in
   easily and the wrong people don't.

The result: **peace of mind for families, dignity for seniors, and an
accountable record of care.**

---

## Key Features

| Feature | What it does |
| --- | --- |
| 👥 **Senior circle** | Add and manage the seniors under your care (profile, age, diagnoses, contact). |
| 💊 **Medication tracking** | Per-senior medication schedules with "taken today" status. |
| 📊 **Care dashboard** | Live stats: number of seniors, medications taken vs. total. |
| 🔗 **Care Ledger** | Append-only, hash-chained log of care events with one-click integrity verification. |
| 🔐 **Authentication** | Email/password (bcrypt) + Google Sign-In, with signed JWT sessions. |
| 🛡️ **Two-step verification** | A 6-digit code step after login for an extra layer at sign-in. |
| 🚧 **Protected routes** | The dashboard is gated behind authentication on the client. |

---

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- Tailwind CSS

**Backend**
- FastAPI (Python 3.12)
- SQLAlchemy (async) + PostgreSQL
- JWT (PyJWT) + bcrypt
- Google Auth (ID-token verification)
- Managed with [uv](https://docs.astral.sh/uv/)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- A PostgreSQL database (e.g. Neon)

### Backend

```bash
cd backend
cp .env.example .env          # then fill in DATABASE_URL, JWT_SECRET_KEY, GOOGLE_CLIENT_ID
uv run uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000/api`
- Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
cp .env.example .env          # then fill in VITE_GOOGLE_CLIENT_ID (and VITE_API_URL if needed)
npm install
npm run dev
```

- App: `http://localhost:5173`

### Environment variables

| Location | Variable | Purpose |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | PostgreSQL connection (asyncpg driver) |
| `backend/.env` | `JWT_SECRET_KEY` | Secret used to sign JWTs (≥ 32 chars) |
| `backend/.env` | `GOOGLE_CLIENT_ID` | Google OAuth web client ID (token verification) |
| `frontend/.env` | `VITE_GOOGLE_CLIENT_ID` | Same Google client ID, used by the browser |
| `frontend/.env` | `VITE_API_URL` | Backend base URL (defaults to `http://localhost:8000/api`) |

> The Google client ID must be **identical** in both files.

---

## Project Structure

```
ClujHackathon2026/
├── backend/
│   └── app/
│       ├── main.py            # FastAPI app + CORS + router wiring
│       ├── core/              # config, async DB, security (JWT, bcrypt)
│       ├── api/
│       │   ├── deps.py        # get_current_user (JWT auth dependency)
│       │   └── routes/        # auth, dashboard, seniors, users, health
│       ├── models/            # SQLAlchemy models (users, seniors, medications)
│       └── schemas/           # Pydantic request/response models
└── frontend/
    └── src/
        ├── pages/             # Landing, Login, SignUp, Dashboard, Seniors, Ledger
        ├── components/
        │   ├── auth/          # GoogleSignInButton, TwoFactorModal, RequireAuth
        │   └── dashboard/     # layout, sidebar, cards, tables
        └── lib/               # api client, auth helpers, ledger (hash chain)
```

---

## How the Care Ledger Works

Each ledger entry stores a `SHA-256` hash computed over its own contents **plus
the previous entry's hash** (`prevHash`). This links entries into a chain:

```
#1  medication.taken   prevHash = 0000…   hash = a1f9…
#2  medication.taken   prevHash = a1f9…   hash = c7b2…   ← chains to #1
#3  diagnoses_updated  prevHash = c7b2…   hash = e3d8…   ← chains to #2
```

If a past entry is edited or removed, its hash no longer matches what the next
entry expects, and the chain visibly breaks. A **Verify integrity** action
recomputes the whole chain and reports exactly where tampering occurred.

---

## Roadmap

- [x] PostgreSQL + async SQLAlchemy
- [x] Email/password login (bcrypt) with signed JWTs
- [x] Google Sign-In
- [x] Two-step verification at login
- [x] Care Ledger (tamper-evident, hash-chained)
- [ ] Persist the ledger server-side (DB table + DB-level immutability)
- [ ] Alembic migrations
- [ ] Automated wellness calls / AI agent integration
```
