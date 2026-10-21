# RaceMind AI - Backend

FastAPI + SQLAlchemy 2.0 (async) + PostgreSQL + Alembic.

## Layout

```
api/          FastAPI app: routes, Pydantic schemas, WebSocket, DI wiring
auth/         Password hashing, JWT issuance/validation
config/       Settings (env-driven) and logging
database/     Declarative base, async session, ORM models, repositories
services/     Business logic - the layer routes actually call
telemetry/    Provider abstraction: UDP listener, replay, recorder, per-year parsers
strategy/     Pit window, undercut/overcut, traffic, weather, tyre/fuel modeling
ai/           LLM client (Anthropic), prompts, session memory, driver-profile analysis
voice/        STT/TTS provider interfaces
alembic/      Database migrations
tests/        Pytest suite (defaults to in-memory SQLite, see conftest.py)
```

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate   # or use --break-system-packages without a venv
pip install -r requirements-dev.txt
cp .env.example .env   # then edit DATABASE_URL / SECRET_KEY for your machine
```

You need a running Postgres instance matching `DATABASE_URL`. The
quickest way is `docker compose up postgres` from the repo root, or point
at any Postgres 14+ instance you already have.

```bash
alembic upgrade head
uvicorn api.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API docs.

## Testing

```bash
pytest                 # in-memory SQLite, no external services needed
ruff check .
mypy .
```

To run the same suite against real Postgres instead:

```bash
TEST_DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/racemind_test pytest
```

## Adding a migration

```bash
# after changing a model in database/models/
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## What's architecture-only right now

- **Per-game-year UDP packet parsing** (`telemetry/parsers/f1_*.py`): the
  transport (real asyncio UDP socket, packet queue, dispatch by game) is
  implemented and tested; the actual byte-layout decoding per F1 game
  year is intentionally left as a registered `NotImplementedError` stub
  rather than a guess - see `telemetry/packet_router.py` for why.
- **Local STT/TTS** (`voice/`): the interfaces are real and the AI
  Engineer's voice-assistant orchestration is wired up to them; no local
  Whisper/TTS implementation is plugged in yet.
- **AI Engineer** (`ai/llm.py`) is fully functional given an
  `ANTHROPIC_API_KEY` - without one, it fails closed with a clear 503
  rather than crashing.
