from __future__ import annotations

from pydantic import BaseModel, Field

from reference.fastf1_client import SessionIdentifier


class ReferenceLapRead(BaseModel):
    driver: str
    driver_number: str
    team: str
    lap_time_s: float
    sector_1_s: float | None
    sector_2_s: float | None
    sector_3_s: float | None
    compound: str | None
    tyre_life_laps: float | None
    speed_trap_kph: float | None
    year: int
    event_name: str
    session_name: str


class ComparisonRequest(BaseModel):
    year: int = Field(ge=1950, le=2100)
    event: str = Field(min_length=1)
    session: SessionIdentifier = Field(default="Q", description="FastF1 session identifier: FP1/FP2/FP3/Q/S/SQ/R")
    driver: str | None = Field(default=None, description="Compare to one driver's lap; omit for the session's outright fastest")
    live_lap_time_s: float = Field(gt=0)
    live_sector_1_s: float | None = None
    live_sector_2_s: float | None = None
    live_sector_3_s: float | None = None
    live_compound: str | None = None


class SectorDeltaRead(BaseModel):
    sector: int
    live_s: float | None
    reference_s: float | None
    delta_s: float | None


class ComparisonRead(BaseModel):
    reference: ReferenceLapRead
    lap_time_delta_s: float
    lap_time_pct: float
    sector_deltas: list[SectorDeltaRead]
    compound_note: str | None
    summary: str
