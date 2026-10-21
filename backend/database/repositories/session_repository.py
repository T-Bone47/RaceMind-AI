from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.models.session import RaceSession
from database.repositories.base import BaseRepository


class SessionRepository(BaseRepository[RaceSession]):
    model = RaceSession

    async def list_for_user(
        self, user_id: uuid.UUID, *, limit: int = 50, offset: int = 0
    ) -> list[RaceSession]:
        result = await self.session.execute(
            select(RaceSession)
            .where(RaceSession.user_id == user_id)
            .order_by(RaceSession.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_with_laps(self, session_id: uuid.UUID) -> RaceSession | None:
        result = await self.session.execute(
            select(RaceSession)
            .where(RaceSession.id == session_id)
            .options(selectinload(RaceSession.laps))
        )
        return result.scalar_one_or_none()
