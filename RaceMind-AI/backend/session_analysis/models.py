"""Core types for session analysis: lap/sector comparison, stint
analysis, tyre/fuel trends, pace evolution, incident detection,
personal bests, and session scoring.

LapRecord is deliberately decoupled from database.models.lap.Lap - the
same pattern coaching.models.TelemetrySample already uses against
database.models.telemetry.TelemetryFrameRecord: this package takes
plain records built by the caller rather than depending on the DB
layer. Tyre/fuel trend inputs reuse strategy.tyre.TyreState and
strategy.fuel.FuelState directly rather than inventing parallel types,
since those are already the established domain-level representation
for this data (services/strategy_service.py does the same
TyreStint/FuelLog -> TyreState/FuelState flattening this package
assumes its caller will do for TyreStint/FuelLog -> TyreState/FuelState
here too).
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from coaching.models import ConsistencyScore
from common.confidence import ConfidenceScore
from database.models.enums import TyreCompound

__all__ = [
    "LapRecord",
    "SectorDelta",
    "LapComparison",
    "StintSummary",
    "TrendDirection",
    "FuelTrend",
    "PaceEvolution",
    "IncidentType",
    "Incident",
    "PersonalBests",
    "SessionScore",
    "SessionReport",
]


@dataclass(frozen=True)
class LapRecord:
    """Mirrors database.models.lap.Lap's analysis-relevant columns -
    session_id/id/timestamps are DB bookkeeping, not domain inputs."""

    lap_number: int
    lap_time_ms: int | None
    sector_1_ms: int | None
    sector_2_ms: int | None
    sector_3_ms: int | None
    is_valid: bool
    tyre_compound: TyreCompound | None
    track_position: int | None


@dataclass(frozen=True)
class SectorDelta:
    sector: int  # 1, 2, or 3
    lap_a_ms: int | None
    lap_b_ms: int | None
    delta_ms: int | None  # lap_b - lap_a; negative = lap_b was faster in this sector


@dataclass(frozen=True)
class LapComparison:
    """positive lap_time_delta_ms (and sector deltas) mean lap_b was
    slower than lap_a - see compare_to_best in lap_comparison.py, which
    always puts the session's fastest lap in lap_a."""

    lap_a: LapRecord
    lap_b: LapRecord
    sector_deltas: list[SectorDelta]
    lap_time_delta_ms: int | None


@dataclass(frozen=True)
class StintSummary:
    """No direction field (unlike PaceEvolution/FuelTrend below) -
    tyre wear only ever increases within a stint, so "trend direction"
    would be redundant with the sign of observed_wear_per_lap_pct."""

    stint_number: int  # 1-based, chronological
    compound: TyreCompound
    lap_numbers: list[int]
    lap_count: int
    average_lap_time_ms: float | None
    best_lap_time_ms: int | None
    wear_pct_start: float
    wear_pct_end: float
    observed_wear_per_lap_pct: float | None  # None if fewer than 2 wear samples this stint
    confidence: ConfidenceScore


class TrendDirection(str, Enum):
    """Shared between PaceEvolution and FuelTrend - "improving" means
    lower is better for both (faster laps; less fuel burned per lap)."""

    IMPROVING = "improving"
    DEGRADING = "degrading"
    STABLE = "stable"


@dataclass(frozen=True)
class FuelTrend:
    lap_numbers: list[int]
    consumption_per_lap_kg: list[float]  # the reported rate at each sample, same order as lap_numbers
    average_consumption_per_lap_kg: float
    direction: TrendDirection
    confidence: ConfidenceScore


@dataclass(frozen=True)
class PaceEvolution:
    lap_numbers: list[int]
    lap_times_ms: list[int]
    direction: TrendDirection
    trend_ms_per_lap: float  # second-half-avg minus first-half-avg, spread over the lap gap between them
    confidence: ConfidenceScore


class IncidentType(str, Enum):
    INVALID_LAP = "invalid_lap"
    ANOMALOUS_CORNER = "anomalous_corner"


@dataclass(frozen=True)
class Incident:
    lap_number: int
    incident_type: IncidentType
    message: str
    confidence: ConfidenceScore


@dataclass(frozen=True)
class PersonalBests:
    best_lap_time_ms: int | None
    best_lap_number: int | None
    best_sector_1_ms: int | None
    best_sector_2_ms: int | None
    best_sector_3_ms: int | None
    theoretical_best_lap_ms: int | None  # sum of best sectors, even if never strung together on one lap


@dataclass(frozen=True)
class SessionScore:
    overall_score_0_100: float
    consistency: ConsistencyScore  # reused from coaching.consistency_analysis, not reimplemented
    valid_lap_ratio: float
    incident_count: int
    confidence: ConfidenceScore


@dataclass(frozen=True)
class SessionReport:
    lap_comparisons: list[LapComparison]
    stints: list[StintSummary]
    fuel_trend: FuelTrend | None
    pace_evolution: PaceEvolution | None
    incidents: list[Incident]
    personal_bests: PersonalBests
    score: SessionScore
