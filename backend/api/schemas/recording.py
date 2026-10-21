from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from api.schemas.common import ORMBase
from database.models.enums import TyreCompound


class TyreStintCreate(ORMBase):
    lap_id: uuid.UUID | None = None
    compound: TyreCompound
    age_laps: int = Field(ge=0)
    wear_fl_pct: float = Field(ge=0, le=100)
    wear_fr_pct: float = Field(ge=0, le=100)
    wear_rl_pct: float = Field(ge=0, le=100)
    wear_rr_pct: float = Field(ge=0, le=100)
    temp_fl_c: float | None = None
    temp_fr_c: float | None = None
    temp_rl_c: float | None = None
    temp_rr_c: float | None = None
    pressure_fl_psi: float | None = None
    pressure_fr_psi: float | None = None
    pressure_rl_psi: float | None = None
    pressure_rr_psi: float | None = None


class TyreStintRead(TyreStintCreate):
    id: uuid.UUID
    session_id: uuid.UUID
    recorded_at: datetime


class FuelLogCreate(ORMBase):
    lap_id: uuid.UUID | None = None
    fuel_remaining_kg: float = Field(ge=0)
    fuel_per_lap_kg: float | None = Field(default=None, ge=0)
    laps_remaining_estimate: float | None = None


class FuelLogRead(FuelLogCreate):
    id: uuid.UUID
    session_id: uuid.UUID
    recorded_at: datetime


class TelemetryFrameRead(ORMBase):
    id: uuid.UUID
    session_id: uuid.UUID
    lap_id: uuid.UUID | None
    timestamp_ms: int
    speed_kph: float
    throttle_pct: float
    brake_pct: float
    steering: float
    gear: int
    engine_rpm: float
    drs_active: bool
