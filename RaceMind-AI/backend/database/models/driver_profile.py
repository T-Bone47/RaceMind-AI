from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.user import User


class DriverProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Long-lived driving-style profile, one per user.

    Scores are 0-100 and updated incrementally by `backend/ai/driver_profile.py`
    as sessions complete, rather than recomputed from scratch each time.
    """

    __tablename__ = "driver_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    aggression_score: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    consistency_score: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    tyre_management_score: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_laps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    user: Mapped[User] = relationship(back_populates="driver_profile")

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"DriverProfile(user_id={self.user_id!s}, consistency={self.consistency_score})"
