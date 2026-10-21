"""Async database engine and per-request session dependency.

Design choice - unit of work per request: `get_db` commits automatically
when the request completes without error, and rolls back on exception.
Repositories therefore only `flush()` (to populate server-generated
defaults like ids and timestamps), never `commit()`. This keeps
transaction boundaries at the API layer, where they belong, instead of
scattered across repository methods.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config.settings import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()



engine_kwargs = {
    "echo": False,
    "future": True,
}

if settings.database_url.startswith("postgresql"):
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 20,
        "max_overflow": 10,
    })

engine = create_async_engine(
    settings.database_url,
    **engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncIterator[AsyncSession]:
    if settings.is_production and "localhost" in settings.database_url:
        raise RuntimeError("Production environment must not use localhost database credentials.")

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
