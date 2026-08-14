from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base
from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from database.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin
from telemetry.models import GameTitle

if TYPE_CHECKING:
    from database.models.user import User


def _setup_enum(enum_cls: type, length: int) -> SqlEnum:
    return SqlEnum(enum_cls, native_enum=False, length=length, values_callable=lambda e: [m.value for m in e])


class CircuitSetup(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A car setup for one circuit/session/weather/device/skill
    combination. Field names and ranges mirror the real game's
    CarSetupData UDP struct (verified against the official F1 24 UDP
    specification - see telemetry/parsers/f1_2024.py) so a setup stored
    here maps directly onto what a player actually enters in-game.

    `source` + `source_attribution` + `created_by_user_id` together
    answer "where did this come from" without hardcoding any one
    external site - see SetupSource and backend/setups/importers/.
    """

    __tablename__ = "circuit_setups"

    game: Mapped[GameTitle] = mapped_column(_setup_enum(GameTitle, 30), nullable=False, index=True)
    track_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    session_type: Mapped[SessionType] = mapped_column(_setup_enum(SessionType, 20), nullable=False)
    weather: Mapped[SetupWeather] = mapped_column(_setup_enum(SetupWeather, 10), nullable=False)
    input_device: Mapped[SetupInputDevice] = mapped_column(_setup_enum(SetupInputDevice, 15), nullable=False)
    skill_level: Mapped[SetupSkillLevel] = mapped_column(_setup_enum(SetupSkillLevel, 15), nullable=False)

    source: Mapped[SetupSource] = mapped_column(_setup_enum(SetupSource, 20), nullable=False)
    source_attribution: Mapped[str | None] = mapped_column(String(300), nullable=True)
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    # --- Aero ---
    front_wing: Mapped[int] = mapped_column(Integer, nullable=False)
    rear_wing: Mapped[int] = mapped_column(Integer, nullable=False)

    # --- Differential ---
    diff_on_throttle: Mapped[int] = mapped_column(Integer, nullable=False)
    diff_off_throttle: Mapped[int] = mapped_column(Integer, nullable=False)

    # --- Suspension geometry ---
    front_camber: Mapped[float] = mapped_column(Float, nullable=False)
    rear_camber: Mapped[float] = mapped_column(Float, nullable=False)
    front_toe: Mapped[float] = mapped_column(Float, nullable=False)
    rear_toe: Mapped[float] = mapped_column(Float, nullable=False)

    # --- Suspension ---
    front_suspension: Mapped[int] = mapped_column(Integer, nullable=False)
    rear_suspension: Mapped[int] = mapped_column(Integer, nullable=False)
    front_anti_roll_bar: Mapped[int] = mapped_column(Integer, nullable=False)
    rear_anti_roll_bar: Mapped[int] = mapped_column(Integer, nullable=False)
    front_ride_height: Mapped[int] = mapped_column(Integer, nullable=False)
    rear_ride_height: Mapped[int] = mapped_column(Integer, nullable=False)

    # --- Brakes ---
    brake_pressure: Mapped[int] = mapped_column(Integer, nullable=False)
    brake_bias: Mapped[int] = mapped_column(Integer, nullable=False)
    engine_braking: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)

    # --- Tyre pressures (PSI) ---
    tyre_pressure_fl: Mapped[float] = mapped_column(Float, nullable=False)
    tyre_pressure_fr: Mapped[float] = mapped_column(Float, nullable=False)
    tyre_pressure_rl: Mapped[float] = mapped_column(Float, nullable=False)
    tyre_pressure_rr: Mapped[float] = mapped_column(Float, nullable=False)

    # --- Weight distribution / fuel ---
    ballast: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    fuel_load: Mapped[float | None] = mapped_column(Float, nullable=True, default=None)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_by: Mapped[User | None] = relationship()

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"CircuitSetup(track={self.track_name!r}, session={self.session_type}, source={self.source})"
