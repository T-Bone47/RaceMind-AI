from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from api.schemas.common import ORMBase
from database.models.enums import TyreCompound


class StrategyRecomputeRequest(ORMBase):
    current_lap: int = Field(ge=1)


class StrategyPlanRead(ORMBase):
    id: uuid.UUID
    session_id: uuid.UUID
    recommended_pit_lap: int | None
    recommended_compound: TyreCompound | None
    reason: str | None
    is_active: bool
    generated_at: datetime
