from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from api.schemas.common import ORMBase
from database.models.enums import SessionType, WeatherCondition
from telemetry.models import GameTitle


class SessionCreate(ORMBase):
    game: GameTitle
    track_name: str = Field(min_length=1, max_length=100)
    session_type: SessionType
    weather: WeatherCondition | None = None
    air_temp_c: float | None = None
    track_temp_c: float | None = None
    total_laps: int | None = Field(default=None, ge=1)


class SessionRead(ORMBase):
    id: uuid.UUID
    user_id: uuid.UUID
    game: GameTitle
    track_name: str
    session_type: SessionType
    weather: WeatherCondition | None
    air_temp_c: float | None
    track_temp_c: float | None
    total_laps: int | None
    started_at: datetime | None
    ended_at: datetime | None
    created_at: datetime
