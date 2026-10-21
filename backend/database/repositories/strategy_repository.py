from __future__ import annotations

import uuid

from sqlalchemy import select, update

from database.models.strategy import StrategyPlan
from database.repositories.base import BaseRepository


class StrategyRepository(BaseRepository[StrategyPlan]):
    model = StrategyPlan

    async def get_active_for_session(self, session_id: uuid.UUID) -> StrategyPlan | None:
        result = await self.session.execute(
            select(StrategyPlan).where(
                StrategyPlan.session_id == session_id, StrategyPlan.is_active.is_(True)
            )
        )
        return result.scalar_one_or_none()

    async def deactivate_all_for_session(self, session_id: uuid.UUID) -> None:
        await self.session.execute(
            update(StrategyPlan)
            .where(StrategyPlan.session_id == session_id)
            .values(is_active=False)
        )
