from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.enums import TyreCompound
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.session import RaceSession


class Lap(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "laps"
    __table_args__ = (
        UniqueConstraint("session_id", "lap_number", name="uq_laps_session_lap_number"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lap_number: Mapped[int] = mapped_column(Integer, nullable=False)
    lap_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sector_1_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sector_2_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sector_3_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    tyre_compound: Mapped[TyreCompound | None] = mapped_column(
        SqlEnum(TyreCompound, native_enum=False, length=20, values_callable=lambda e: [m.value for m in e]),
        nullable=True,
    )
    track_position: Mapped[int | None] = mapped_column(Integer, nullable=True)

    session: Mapped[RaceSession] = relationship(back_populates="laps")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"Lap(session_id={self.session_id!s}, lap_number={self.lap_number}, time_ms={self.lap_time_ms})"
