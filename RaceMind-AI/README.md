# RaceMind AI

An AI-powered race engineering assistant for sim racing telemetry - built
around a normalized, game-agnostic telemetry abstraction (Codemasters F1
titles first, Assetto Corsa/ACC/iRacing/Le Mans Ultimate/rFactor 2 as
future providers), a rule-based strategy engine (pit windows, undercut/
overcut, tyre and weather modeling), and an LLM-driven "AI Engineer" for
radio-style Q&A during a session.

Original implementation, not derived from any existing telemetry tool's
code - see `docs/ARCHITECTURE.md` for design rationale.

## Status

**Backend: implemented and verified.** Full REST + WebSocket API, JWT
auth, Postgres via async SQLAlchemy 2.0 + Alembic, the telemetry
abstraction layer, the full strategy engine, and the AI Engineer. Test
suite is green against both SQLite and a real Postgres instance;
`mypy`/`ruff` are clean.

**Website, desktop app, and shared `packages/`: not yet built.** This is
a monorepo skeleton for those - see the structure below.

## Quickstart (backend)

```bash
docker compose up postgres -d
cd backend
pip install -r requirements-dev.txt   # or: python3 -m venv .venv && source .venv/bin/activate first
cp .env.example .env
alembic upgrade head
uvicorn api.main:app --reload
```

API docs at `http://localhost:8000/docs`. See `backend/README.md` for
testing, migrations, and what's architecture-only vs. fully implemented.

## Structure

```
apps/
  website/         Next.js marketing/docs site (not yet built)
  desktop/         Electron app (not yet built)
backend/           FastAPI service - see backend/README.md
packages/
  ui/              Shared React components (not yet built)
  shared/          Shared utilities (not yet built)
  types/           Shared TypeScript types (not yet built)
  config/          Shared tsconfig/eslint config
database/          Generated schema.sql reference (Alembic is the real source of truth)
docker/            Additional Dockerfiles as apps are added
docs/              Architecture notes
scripts/           Dev/setup scripts
```

## Tech stack

Next.js, React, TypeScript, TailwindCSS, Framer Motion, Zustand, TanStack
Query, Electron - frontend (pending). FastAPI, SQLAlchemy 2.0 (async),
Alembic, PostgreSQL, WebSockets, Pydantic v2 - backend (built). pnpm +
Turborepo, Docker Compose, GitHub Actions.

## License

MIT - see [LICENSE](LICENSE).
