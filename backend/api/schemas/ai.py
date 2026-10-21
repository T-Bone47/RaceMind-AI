from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class RaceContextIn(BaseModel):
    current_lap: int = Field(ge=1)
    total_laps: int = Field(ge=1)
    position: int = Field(ge=1)
    tyre_compound: str
    tyre_age_laps: int = Field(ge=0)
    gap_to_ahead_s: float | None = None
    gap_to_behind_s: float | None = None
    recent_events: list[str] = Field(default_factory=list)


class AskRequest(BaseModel):
    session_id: uuid.UUID
    question: str = Field(min_length=1, max_length=500)
    context: RaceContextIn


class AskResponse(BaseModel):
    answer: str
