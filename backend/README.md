# Backend — ClujHackathon2026

FastAPI backend backed by PostgreSQL (Neon). Managed with [uv](https://docs.astral.sh/uv/).

## Run

```bash
cd backend
cp .env.example .env          # then set DATABASE_URL
uv run uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000/api`
- Interactive docs (Swagger): `http://localhost:8000/docs`

## Endpoints

| Method | Path              | Description                              |
| ------ | ----------------- | ---------------------------------------- |
| GET    | `/api/health`     | Health check                             |
| POST   | `/api/auth/login` | Login by email + password (bcrypt)       |

`POST /api/auth/login` body:

```json
{ "email": "user@example.com", "password": "secret" }
```

Returns an access token plus the user's id, email and name; `401` on bad credentials.

## Project layout

```
app/
  main.py            # FastAPI app + CORS + router wiring
  core/
    config.py        # settings (env-driven)
    database.py      # async engine, session, Base, get_db
    security.py      # bcrypt hash / verify
  api/routes/        # endpoints (health, auth)
  models/            # SQLAlchemy models (User -> users table)
  schemas/           # pydantic request/response models
```

## Database

`DATABASE_URL` uses the asyncpg driver, e.g.:

```
postgresql+asyncpg://USER:PASSWORD@HOST:5432/DBNAME?ssl=require
```

Passwords are stored as bcrypt hashes in `users.password_hash`.

## Roadmap

- [x] PostgreSQL + SQLAlchemy
- [x] DB-backed login (email + bcrypt password)
- [ ] Real signed JWT (current token is a placeholder)
- [ ] Alembic migrations
- [ ] n8n integration (trigger workflows / receive callbacks for AI agents)
