from __future__ import annotations

import uuid

from sqlalchemy import select

from database.models.circuit_setup import CircuitSetup
from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from database.repositories.base import BaseRepository
from telemetry.models import GameTitle


class CircuitSetupRepository(BaseRepository[CircuitSetup]):
    model = CircuitSetup

    async def find_matches(
        self,
        *,
        game: GameTitle,
        track_name: str,
        session_type: SessionType,
        weather: SetupWeather,
        input_device: SetupInputDevice,
        skill_level: SetupSkillLevel,
    ) -> list[CircuitSetup]:
        """Exact match on every dimension. Callers wanting graceful
        fallback (e.g. no exact skill-level match) should use
        `setups.recommender`, which calls this multiple times with
        progressively relaxed criteria rather than this repository
        silently guessing what "close enough" means."""
        result = await self.session.execute(
            select(CircuitSetup).where(
                CircuitSetup.game == game,
                CircuitSetup.track_name == track_name,
                CircuitSetup.session_type == session_type,
                CircuitSetup.weather == weather,
                CircuitSetup.input_device == input_device,
                CircuitSetup.skill_level == skill_level,
            )
        )
        return list(result.scalars().all())

    async def list_for_track(
        self, game: GameTitle, track_name: str, *, limit: int = 100, offset: int = 0
    ) -> list[CircuitSetup]:
        result = await self.session.execute(
            select(CircuitSetup)
            .where(CircuitSetup.game == game, CircuitSetup.track_name == track_name)
            .order_by(CircuitSetup.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_by_source(self, source: SetupSource, *, limit: int = 100) -> list[CircuitSetup]:
        result = await self.session.execute(
            select(CircuitSetup).where(CircuitSetup.source == source).limit(limit)
        )
        return list(result.scalars().all())

    async def list_for_user(self, user_id: uuid.UUID) -> list[CircuitSetup]:
        result = await self.session.execute(
            select(CircuitSetup).where(CircuitSetup.created_by_user_id == user_id)
        )
        return list(result.scalars().all())
