# Backend — ClujHackathon2026

FastAPI backend. Managed with [uv](https://docs.astral.sh/uv/).

## Run

```bash
cd backend
cp .env.example .env          # optional, defaults work out of the box
uv run uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000/api`
- Interactive docs (Swagger): `http://localhost:8000/docs`

## Endpoints

| Method | Path              | Description                          |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/api/health`     | Health check                         |
| POST   | `/api/auth/login` | Login. Temporary: `admin` / `admin`  |

`POST /api/auth/login` body:

```json
{ "username": "admin", "password": "admin" }
```

## Project layout

```
app/
  main.py            # FastAPI app + CORS + router wiring
  core/config.py     # settings (env-driven)
  api/routes/        # endpoints (health, auth)
  schemas/           # pydantic request/response models
```

## Roadmap

- [ ] PostgreSQL + SQLAlchemy + Alembic migrations
- [ ] Replace hardcoded login with DB-backed users + real JWT
- [ ] n8n integration (trigger workflows / receive callbacks for AI agents)
