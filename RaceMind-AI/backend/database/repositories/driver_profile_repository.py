from __future__ import annotations

import uuid

from sqlalchemy import select

from database.models.driver_profile import DriverProfile
from database.repositories.base import BaseRepository


class DriverProfileRepository(BaseRepository[DriverProfile]):
    model = DriverProfile

    async def get_by_user_id(self, user_id: uuid.UUID) -> DriverProfile | None:
        result = await self.session.execute(
            select(DriverProfile).where(DriverProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()
