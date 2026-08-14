"""Generic repository base class.

Concrete repositories subclass this and set `model`, then add whatever
domain-specific query methods they need (e.g. `UserRepository.get_by_email`).
Transactions are NOT committed here - see `database/session.py` for why.
"""

from __future__ import annotations

import uuid
from typing import TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.base import Base

from typing import Generic, TypeVar

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    model: type[ModelType]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, id_: uuid.UUID) -> ModelType | None:
        return await self.session.get(self.model, id_)

    async def list_all(self, *, limit: int = 100, offset: int = 0) -> list[ModelType]:
        result = await self.session.execute(
            select(self.model).limit(limit).offset(offset)
        )
        return list(result.scalars().all())

    async def create(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def create_batch(self, objs: list[ModelType]) -> list[ModelType]:
        self.session.add_all(objs)
        await self.session.flush()
        return objs

    async def delete(self, obj: ModelType) -> None:
        await self.session.delete(obj)
        await self.session.flush()
