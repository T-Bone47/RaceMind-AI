# Database

`schema.sql` is a **generated, read-only reference** - a plain-SQL dump of
the schema as it exists after running every migration. It's here so
anyone (DBAs, reviewers, other tools) can see the actual DDL without
reading Python or running the app.

**It is not the source of truth.** The real migrations - the thing you
actually run - live in [`backend/alembic/versions/`](../backend/alembic/versions/),
generated from the SQLAlchemy models in `backend/database/models/`.

To regenerate `schema.sql` after changing a model:

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
pg_dump -h localhost -U racemind -d racemind --schema-only --no-owner --no-privileges > ../database/schema.sql
```

`migrations/` in this folder is intentionally empty (see `.gitkeep`) -
it's reserved in case a future non-Alembic migration path is needed,
but there isn't one today.
