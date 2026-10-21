from __future__ import annotations

import uuid

from api.schemas.common import ORMBase


class DriverProfileRead(ORMBase):
    id: uuid.UUID
    user_id: uuid.UUID
    aggression_score: float
    consistency_score: float
    tyre_management_score: float
    total_sessions: int
    total_laps: int
    notes: str | None
