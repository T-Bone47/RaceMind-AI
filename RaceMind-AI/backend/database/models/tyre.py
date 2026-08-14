from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.enums import TyreCompound
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.session import RaceSession


class TyreStint(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A tyre-wear/temperature/pressure sample recorded during a stint.

    Corner naming: FL/FR/RL/RR = front-left, front-right, rear-left,
    rear-right, matching the convention used across the telemetry layer.
    """

    __tablename__ = "tyre_stints"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lap_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("laps.id", ondelete="SET NULL"), nullable=True
    )
    compound: Mapped[TyreCompound] = mapped_column(
        SqlEnum(TyreCompound, native_enum=False, length=20, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )
    age_laps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    wear_fl_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wear_fr_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wear_rl_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wear_rr_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    temp_fl_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_fr_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_rl_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp_rr_c: Mapped[float | None] = mapped_column(Float, nullable=True)

    pressure_fl_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure_fr_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure_rl_psi: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure_rr_psi: Mapped[float | None] = mapped_column(Float, nullable=True)

    recorded_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    session: Mapped[RaceSession] = relationship(back_populates="tyre_stints")

    @property
    def average_wear_pct(self) -> float:
        return (self.wear_fl_pct + self.wear_fr_pct + self.wear_rl_pct + self.wear_rr_pct) / 4

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"TyreStint(session_id={self.session_id!s}, compound={self.compound}, age_laps={self.age_laps})"
