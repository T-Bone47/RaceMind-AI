from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.enums import SessionType, WeatherCondition
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from telemetry.models import GameTitle

if TYPE_CHECKING:
    from database.models.driver_profile import DriverProfile  # noqa: F401
    from database.models.fuel import FuelLog
    from database.models.lap import Lap
    from database.models.strategy import StrategyPlan
    from database.models.telemetry import TelemetryFrameRecord
    from database.models.tyre import TyreStint
    from database.models.user import User


class RaceSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single practice/qualifying/race/time-trial session.

    Named `RaceSession` (table `sessions`) rather than `Session` to avoid
    shadowing `sqlalchemy.orm.Session` throughout the codebase.
    """

    __tablename__ = "sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    game: Mapped[GameTitle] = mapped_column(
        SqlEnum(GameTitle, native_enum=False, length=30, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    track_name: Mapped[str] = mapped_column(String(100), nullable=False)
    session_type: Mapped[SessionType] = mapped_column(
        SqlEnum(SessionType, native_enum=False, length=20, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    weather: Mapped[WeatherCondition | None] = mapped_column(
        SqlEnum(WeatherCondition, native_enum=False, length=20, values_callable=lambda e: [m.value for m in e]),
        nullable=True,
    )
    air_temp_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    track_temp_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_laps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(nullable=True)

    user: Mapped[User] = relationship(back_populates="sessions")
    laps: Mapped[list[Lap]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Lap.lap_number"
    )
    tyre_stints: Mapped[list[TyreStint]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    fuel_logs: Mapped[list[FuelLog]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    telemetry_frames: Mapped[list[TelemetryFrameRecord]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    strategy_plans: Mapped[list[StrategyPlan]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"RaceSession(id={self.id!s}, track={self.track_name!r}, type={self.session_type})"
