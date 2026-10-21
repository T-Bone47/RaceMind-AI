from __future__ import annotations

import uuid

from sqlalchemy import select

from database.models.lap import Lap
from database.repositories.base import BaseRepository


class LapRepository(BaseRepository[Lap]):
    model = Lap

    async def list_for_session(self, session_id: uuid.UUID) -> list[Lap]:
        result = await self.session.execute(
            select(Lap).where(Lap.session_id == session_id).order_by(Lap.lap_number)
        )
        return list(result.scalars().all())

    async def get_by_lap_number(self, session_id: uuid.UUID, lap_number: int) -> Lap | None:
        result = await self.session.execute(
            select(Lap).where(Lap.session_id == session_id, Lap.lap_number == lap_number)
        )
        return result.scalar_one_or_none()
