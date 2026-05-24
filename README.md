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
elder care, with four ideas at its core:

1. **One shared care dashboard.** Each caregiver sees the seniors in their
   circle, their medication schedules, and at-a-glance stats — what's due,
   what's been taken, and how the day is going.
2. **An AI agent that actually calls the senior.** When a scheduled dose is
   missed, an n8n workflow places an outbound voice call (via ElevenLabs +
   Twilio) with a warm, personalized Romanian-language assistant. The agent
   reminds the senior, asks how they feel, and escalates to the family on
   severe symptoms. The conversation is transcribed and fed back into the
   database automatically.
3. **A tamper-evident Care Ledger.** Every important care event (a medication
   administered, a diagnosis updated) is written to an append-only ledger where
   each entry is cryptographically chained to the previous one. Records cannot
   be silently edited or deleted — any tampering is instantly detectable. This
   brings blockchain-style integrity guarantees to sensitive medical history.
4. **Secure, frictionless access.** Email/password and Google Sign-In, JWT
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
| 📞 **Automated wellness calls** | An n8n workflow detects missed doses each hour and triggers an ElevenLabs voice agent that calls the senior in Romanian, with personalized prompts. |
| 📝 **Auto-transcribed call logs** | A post-call webhook stores the transcript, AI summary, and "medication confirmed?" flag, and marks medications as taken automatically. |
| 📊 **Care dashboard** | Live stats: number of seniors, medications taken vs. total. |
| 🔗 **Care Ledger** | Append-only, hash-chained log of care events with one-click integrity verification. |
| 💳 **Subscriptions & payments** | Caregivers can subscribe to a pricing plan; admins manage plans, subscriptions, payments, and reviews. (Stripe is simulated for the demo.) |
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

**AI agent & automation**
- [n8n](https://n8n.io/) for workflow orchestration (scheduled jobs, Postgres triggers, webhooks)
- [ElevenLabs Conversational AI](https://elevenlabs.io/) + Twilio for outbound voice calls
- OpenAI (used as a fallback path that simulates conversations for local/demo testing)

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

## How the AI Agent Calls Work (n8n)

Two n8n workflows sit between the database and an ElevenLabs voice agent. They
implement the full "missed dose → call → transcript → mark as taken" loop with
no human in the middle.

### Workflow 1 — `InTouch AI Agent Automation` (outbound)

This workflow is triggered in two ways:

- **Hourly schedule.** Once per hour, every `medications.is_taken_today` flag
  is reset to `FALSE` so the day starts fresh, and the workflow queries:

  ```sql
  SELECT seniors.*, STRING_AGG(medications.medication_name || ' (' || medications.dose || ')', ' and ') AS all_missed_meds, ...
  FROM seniors JOIN medications ON seniors.id = medications.senior_id
  WHERE medications.is_taken_today = FALSE
    AND medications.scheduled_time <= LOCALTIME
  GROUP BY seniors.id, seniors.caregiver_id;
  ```

- **Postgres `INSERT` trigger on `seniors`.** When a caregiver adds a new
  senior in the app, the workflow picks that senior up immediately.

For every senior that still has pending medications, a Python step builds a
personalized **Romanian-language** system prompt for the voice agent:

- Includes the senior's name, age, gender, diagnoses, the list of missed
  medications, and their current stock levels.
- Encodes four conversation scenarios the agent must handle:
  - **A** — Feeling well & took meds → praise; warn if stock is low; end call.
  - **B** — Forgot meds → gently encourage them to take it.
  - **C** — Mild symptoms (tired, headache) → empathy + safe advice; end call.
  - **D** — Severe symptoms (chest pain, fall, severe dizziness) → stop asking
    about medication, tell them to contact family/doctor immediately, notify
    the caregiver, and end the call.
- Forces polite Romanian (`dumneavoastră`) and a clean "La revedere" hang-up.

The prompt is sent to ElevenLabs via the Twilio outbound-call endpoint:

```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
{
  "agent_id": "...",
  "agent_phone_number_id": "...",
  "to_number": "<senior phone>",
  "conversation_initiation_client_data": {
    "conversation_config_override": {
      "agent": { "prompt": { "prompt": "<personalized prompt>" } }
    }
  }
}
```

A row is inserted into `calls` with `status = 'initiated'` and the
`elevenlabs_call_id` returned by the API — this is the join key for the
post-call webhook below.

> **Demo fallback.** A second branch of the same workflow uses OpenAI to
> *simulate* a conversation (Romanian transcript + summary + a boolean) and
> writes a `completed` call directly. This is used when running locally
> without Twilio credentials.

### Workflow 2 — `TranscriptExtractionHook` (inbound)

When the ElevenLabs agent finishes a call, ElevenLabs POSTs the conversation
data to this n8n webhook. It performs two updates:

1. **Close out the call row** — matched by `elevenlabs_call_id`:

   ```sql
   UPDATE calls
   SET ended_at = CURRENT_TIMESTAMP,
       status = 'completed',
       transcript = '<transcript_summary>',
       ai_summary = '<call_summary>',
       medication_confirmed = '<medication_taken>'
   WHERE elevenlabs_call_id = '<system__conversation_id>';
   ```

2. **Flip medications to taken** — but only if the agent actually confirmed:

   ```sql
   UPDATE medications SET is_taken_today = TRUE
   WHERE id = ANY (SELECT unnest(medication_ids) FROM calls WHERE elevenlabs_call_id = '<id>')
     AND '<medication_taken>' = 'true';
   ```

That's the full loop: the dashboard sees the medication as taken, the Calls
page shows the transcript + AI summary, and the caregiver never had to do
anything.

### Configuration

The workflows live in n8n (not in this repo) and require:

- **Postgres credentials** pointing at the same `DATABASE_URL` the FastAPI
  backend uses.
- **HTTP Header Auth credential** holding the ElevenLabs API key (sent as
  `xi-api-key`).
- An **OpenAI credential** for the simulation branch (optional).
- A reachable webhook URL configured as the ElevenLabs *post-call webhook* —
  the path is `/webhook/685d383d-9435-4f0b-8ab4-827fef0ab352` on your n8n
  instance.

---

## Roadmap

- [x] PostgreSQL + async SQLAlchemy
- [x] Email/password login (bcrypt) with signed JWTs
- [x] Google Sign-In
- [x] Two-step verification at login
- [x] Care Ledger (tamper-evident, hash-chained)
- [x] Automated wellness calls / AI agent integration (n8n + ElevenLabs + Twilio)
- [ ] Persist the ledger server-side (DB table + DB-level immutability)
- [ ] Alembic migrations
- [ ] Check the n8n workflow JSON exports into the repo (`automation/`) so they
      live alongside the code they orchestrate
```
