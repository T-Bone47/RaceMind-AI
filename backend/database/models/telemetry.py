from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.mixins import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.session import RaceSession


class TelemetryFrameRecord(UUIDPrimaryKeyMixin, Base):
    """Persisted telemetry sample.

    Deliberately does NOT use `TimestampMixin` - at 20-60Hz an `updated_at`
    that never updates is dead weight, and `timestamp_ms` already carries
    the domain-meaningful time. This is the storage counterpart to
    `telemetry.models.TelemetryFrame`, which is the in-memory/streaming DTO;
    the API layer maps one to the other rather than sharing a class,
    since one is a wire format and the other is a table.

    At high sample rates a normalized Postgres table is the simple
    choice, not necessarily the fastest one - a future milestone may
    move this to batched Parquet/TimescaleDB and keep Postgres for the
    lower-frequency tables. The repository's `create_batch` already
    inserts in bulk so that swap wouldn't change the call sites much.
    """

    __tablename__ = "telemetry_frames"
    __table_args__ = (Index("ix_telemetry_frames_session_ts", "session_id", "timestamp_ms"),)

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    lap_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("laps.id", ondelete="SET NULL"), nullable=True
    )
    timestamp_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    speed_kph: Mapped[float] = mapped_column(Float, nullable=False)
    throttle_pct: Mapped[float] = mapped_column(Float, nullable=False)
    brake_pct: Mapped[float] = mapped_column(Float, nullable=False)
    steering: Mapped[float] = mapped_column(Float, nullable=False)
    gear: Mapped[int] = mapped_column(Integer, nullable=False)
    engine_rpm: Mapped[float] = mapped_column(Float, nullable=False)
    drs_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    session: Mapped[RaceSession] = relationship(back_populates="telemetry_frames")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"TelemetryFrameRecord(session_id={self.session_id!s}, t={self.timestamp_ms})"
