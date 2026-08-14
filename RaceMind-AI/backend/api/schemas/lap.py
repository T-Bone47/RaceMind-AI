from __future__ import annotations

import uuid

from pydantic import Field

from api.schemas.common import ORMBase
from database.models.enums import TyreCompound


class LapCreate(ORMBase):
    lap_number: int = Field(ge=1)
    lap_time_ms: int | None = Field(default=None, ge=0)
    sector_1_ms: int | None = Field(default=None, ge=0)
    sector_2_ms: int | None = Field(default=None, ge=0)
    sector_3_ms: int | None = Field(default=None, ge=0)
    is_valid: bool = True
    tyre_compound: TyreCompound | None = None
    track_position: int | None = Field(default=None, ge=1)


class LapRead(ORMBase):
    id: uuid.UUID
    session_id: uuid.UUID
    lap_number: int
    lap_time_ms: int | None
    sector_1_ms: int | None
    sector_2_ms: int | None
    sector_3_ms: int | None
    is_valid: bool
    tyre_compound: TyreCompound | None
    track_position: int | None
