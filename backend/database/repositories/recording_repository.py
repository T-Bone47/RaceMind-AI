"""Repositories for the high-frequency data recorded live during a session:
tyre stints, fuel logs, and raw telemetry frames.

Grouped in one module because they share a access pattern - write-heavy,
always scoped to a session, rarely updated after insert - rather than
because they're the same table.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select

from database.models.fuel import FuelLog
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint
from database.repositories.base import BaseRepository


class TyreStintRepository(BaseRepository[TyreStint]):
    model = TyreStint

    async def latest_for_session(self, session_id: uuid.UUID) -> TyreStint | None:
        result = await self.session.execute(
            select(TyreStint)
            .where(TyreStint.session_id == session_id)
            .order_by(TyreStint.recorded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def list_for_session(self, session_id: uuid.UUID) -> list[TyreStint]:
        """Full wear history for a session, oldest first - used by the
        Driver Coach to build a `TyreWearSnapshot` trend rather than
        just the single latest reading `latest_for_session` returns."""
        result = await self.session.execute(
            select(TyreStint)
            .where(TyreStint.session_id == session_id)
            .order_by(TyreStint.recorded_at)
        )
        return list(result.scalars().all())


class FuelLogRepository(BaseRepository[FuelLog]):
    model = FuelLog

    async def latest_for_session(self, session_id: uuid.UUID) -> FuelLog | None:
        result = await self.session.execute(
            select(FuelLog)
            .where(FuelLog.session_id == session_id)
            .order_by(FuelLog.recorded_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


class TelemetryFrameRepository(BaseRepository[TelemetryFrameRecord]):
    model = TelemetryFrameRecord

    async def list_for_session(
        self, session_id: uuid.UUID, *, limit: int = 1000, offset: int = 0
    ) -> list[TelemetryFrameRecord]:
        result = await self.session.execute(
            select(TelemetryFrameRecord)
            .where(TelemetryFrameRecord.session_id == session_id)
            .order_by(TelemetryFrameRecord.timestamp_ms)
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def list_for_lap(self, lap_id: uuid.UUID) -> list[TelemetryFrameRecord]:
        """All frames attributed to one lap, timestamp-ascending. Used
        by the Driver Coach service instead of `list_for_session` +
        an in-memory group-by, since a session's total frame count can
        exceed any single pagination window while one lap's cannot."""
        result = await self.session.execute(
            select(TelemetryFrameRecord)
            .where(TelemetryFrameRecord.lap_id == lap_id)
            .order_by(TelemetryFrameRecord.timestamp_ms)
        )
        return list(result.scalars().all())
