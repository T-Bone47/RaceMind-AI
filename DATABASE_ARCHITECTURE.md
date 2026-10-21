# Database Directory Architecture

This project has two `database/` directories. **They are not duplicates** — they serve different purposes.

## Authoritative: `backend/database/`

This is the **live, runtime-authoritative** database layer.

| Component | Path |
|---|---|
| ORM Models | `backend/database/models/*.py` |
| Session / Engine | `backend/database/session.py` |
| Repositories | `backend/database/repositories/*.py` |
| Alembic Migrations | `backend/alembic/versions/*.py` |
| Base Declarative | `backend/database/base.py` |

Every Python module in the application imports from `backend/database/`:

```python
from database.models.user import User
from database.session import get_db
from database.repositories.session_repository import SessionRepository
```

This works because the application runs with `backend/` as the working directory
(or `backend/` on `sys.path`), so `database` resolves to `backend/database/`.

All schema changes go through:
1. Modify the SQLAlchemy model in `backend/database/models/`
2. Generate an Alembic migration: `alembic revision --autogenerate`
3. Apply: `alembic upgrade head`

## Reference Only: `database/` (project root)

This is a **read-only, generated reference** — a `pg_dump --schema-only` snapshot.

- `database/schema.sql` — Plain SQL DDL for reviewers, DBAs, and external tools
- `database/migrations/` — Empty (reserved, see `.gitkeep`)
- `database/README.md` — Explicitly states "It is not the source of truth"

This file is **never imported** and **never executed** at runtime. It exists so
anyone can see the database schema without reading Python or running the app.

To regenerate it after a migration:

```bash
cd backend
alembic upgrade head
pg_dump -h localhost -U racemind -d racemind --schema-only --no-owner --no-privileges > ../database/schema.sql
```

## Summary

| Directory | Purpose | Imported at runtime? | Source of truth? |
|---|---|---|---|
| `backend/database/` | ORM models, sessions, repositories | **Yes** | **Yes** |
| `database/` (root) | Generated SQL reference dump | No | No |
