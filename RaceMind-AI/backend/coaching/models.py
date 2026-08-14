"""Core types for the AI Driver Coach.

`TelemetrySample` is deliberately decoupled from
`database.models.telemetry.TelemetryFrameRecord` - this module takes
plain samples built by the caller from whatever source (live telemetry,
a recorded session, a replay) rather than depending on the DB layer,
matching the pattern already established in strategy/ and engineer/.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from common.confidence import ConfidenceScore

__all__ = [
    "TelemetrySample",
    "CornerPhase",
    "CornerEvent",
    "ConfidenceScore",
    "PhaseFeedback",
    "CornerCoachingTip",
    "ConsistencyScore",
    "TyrePreservationTip",
    "CoachingReport",
]


@dataclass(frozen=True)
class TelemetrySample:
    lap_distance_m: float
    speed_kph: float
    throttle_pct: float
    brake_pct: float
    steering: float  # -1.0 (full left) to 1.0 (full right)


class CornerPhase(str, Enum):
    ENTRY = "entry"
    MID = "mid"
    EXIT = "exit"


@dataclass(frozen=True)
class CornerEvent:
    """A corner detected from the telemetry signal itself - see
    corner_detection.py. `index` is 1-based in track-distance order,
    not a claim about which numbered corner this is on the real circuit
    (this module has no track map to know that)."""

    index: int
    entry_distance_m: float
    apex_distance_m: float
    exit_distance_m: float
    entry_speed_kph: float
    min_speed_kph: float
    exit_speed_kph: float


@dataclass(frozen=True)
class PhaseFeedback:
    phase: CornerPhase
    message: str
    confidence: ConfidenceScore


@dataclass(frozen=True)
class CornerCoachingTip:
    corner: CornerEvent
    entry: PhaseFeedback
    mid: PhaseFeedback
    exit: PhaseFeedback
    steering_smoothness_note: str
    steering_corrections: int
    potential_gain_kph: float | None  # vs. this driver's own best minimum speed at this corner this session


@dataclass(frozen=True)
class ConsistencyScore:
    score_0_100: float
    lap_time_stdev_ms: float
    lap_count: int
    confidence: ConfidenceScore


@dataclass(frozen=True)
class TyrePreservationTip:
    message: str
    reasoning: str
    confidence: ConfidenceScore


@dataclass(frozen=True)
class CoachingReport:
    corner_tips: list[CornerCoachingTip]
    consistency: ConsistencyScore
    tyre_preservation: list[TyrePreservationTip]
