from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from telemetry.models import GameTitle


class CircuitSetupCreate(BaseModel):
    game: GameTitle
    track_name: str = Field(min_length=1, max_length=100)
    session_type: SessionType
    weather: SetupWeather
    input_device: SetupInputDevice
    skill_level: SetupSkillLevel
    name: str = Field(min_length=1, max_length=150)
    notes: str | None = Field(default=None, max_length=1000)
    track_guide_video_url: str | None = Field(default=None, max_length=1000)
    race_strategy_notes: str | None = Field(default=None, max_length=1000)

    front_wing: int = Field(ge=0, le=50)
    rear_wing: int = Field(ge=0, le=50)
    diff_on_throttle: int = Field(ge=0, le=100)
    diff_off_throttle: int = Field(ge=0, le=100)
    front_camber: float = Field(ge=-3.5, le=0.0)
    rear_camber: float = Field(ge=-3.5, le=3.5)
    front_toe: float = Field(ge=0.0, le=0.5)
    rear_toe: float = Field(ge=0.0, le=0.5)
    front_suspension: int = Field(ge=1, le=41)
    rear_suspension: int = Field(ge=1, le=41)
    front_anti_roll_bar: int = Field(ge=1, le=21)
    rear_anti_roll_bar: int = Field(ge=1, le=21)
    front_ride_height: int = Field(ge=1, le=41)
    rear_ride_height: int = Field(ge=1, le=41)
    brake_pressure: int = Field(ge=80, le=100)
    brake_bias: int = Field(ge=50, le=70)
    engine_braking: int | None = Field(default=None, ge=0, le=100)
    tyre_pressure_fl: float = Field(ge=18.0, le=30.0)
    tyre_pressure_fr: float = Field(ge=18.0, le=30.0)
    tyre_pressure_rl: float = Field(ge=18.0, le=30.0)
    tyre_pressure_rr: float = Field(ge=18.0, le=30.0)
    ballast: int | None = Field(default=None, ge=0, le=20)
    fuel_load: float | None = Field(default=None, ge=0.0, le=110.0)


class CircuitSetupRead(CircuitSetupCreate):
    id: uuid.UUID
    source: SetupSource
    source_attribution: str | None
    created_by_user_id: uuid.UUID | None
    is_verified: bool
    created_at: datetime


class SetupRecommendationRequest(BaseModel):
    game: GameTitle
    track_name: str = Field(min_length=1)
    session_type: SessionType
    weather: SetupWeather
    input_device: SetupInputDevice
    skill_level: SetupSkillLevel


class SetupRecommendationRead(BaseModel):
    setup: CircuitSetupRead
    is_exact_match: bool
    fallback_reason: str | None
