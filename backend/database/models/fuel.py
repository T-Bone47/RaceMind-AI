from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.session import RaceSession


class FuelLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "fuel_logs"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lap_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("laps.id", ondelete="SET NULL"), nullable=True
    )
    fuel_remaining_kg: Mapped[float] = mapped_column(Float, nullable=False)
    fuel_per_lap_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    laps_remaining_estimate: Mapped[float | None] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    session: Mapped[RaceSession] = relationship(back_populates="fuel_logs")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"FuelLog(session_id={self.session_id!s}, remaining_kg={self.fuel_remaining_kg})"
