"""Core types for the race engineer advisory engine.

Deliberately self-contained: the only imports from elsewhere in the
codebase are the existing `strategy.tyre.TyreState` and
`strategy.fuel.FuelState` dataclasses (reused, not duplicated) - every
other type here (TrackStatus, ERSState, CarDamageState, Recommendation)
is new, so this module never needed to modify strategy/, ai/, or
telemetry/ to exist.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from common.confidence import ConfidenceScore
from database.models.enums import WeatherCondition
from strategy.fuel import FuelState
from strategy.tyre import TyreState


class RecommendationCategory(str, Enum):
    TYRE = "tyre"
    FUEL = "fuel"
    ERS = "ers"
    DRS = "drs"
    PIT_WINDOW = "pit_window"
    WEATHER = "weather"
    FLAG = "flag"
    SAFETY_CAR = "safety_car"
    DAMAGE = "damage"
    UNDERCUT = "undercut"
    OVERCUT = "overcut"
    PUSH_CONSERVE = "push_conserve"


class RecommendationPriority(str, Enum):
    """Ordered low to high - `advisor.py` sorts output by this."""

    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


_PRIORITY_RANK: dict[RecommendationPriority, int] = {
    RecommendationPriority.INFO: 0,
    RecommendationPriority.LOW: 1,
    RecommendationPriority.MEDIUM: 2,
    RecommendationPriority.HIGH: 3,
    RecommendationPriority.CRITICAL: 4,
}


def priority_rank(priority: RecommendationPriority) -> int:
    return _PRIORITY_RANK[priority]


@dataclass(frozen=True)
class Recommendation:
    category: RecommendationCategory
    priority: RecommendationPriority
    confidence: ConfidenceScore  # how much data backs this claim - see common.confidence
    message: str  # radio-length, actionable - what the driver should do
    reasoning: str  # the "why" behind it - grounded in the state that produced it


class TrackStatus(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    DOUBLE_YELLOW = "double_yellow"
    SAFETY_CAR = "safety_car"
    VIRTUAL_SAFETY_CAR = "virtual_safety_car"
    RED = "red"


@dataclass(frozen=True)
class ERSState:
    state_of_charge_pct: float  # 0-100
    deployment_mode: str = "balanced"  # "harvest" / "balanced" / "overtake" / "hotlap"


@dataclass(frozen=True)
class CarDamageState:
    """0-100 per component - 0 is undamaged. Deliberately a flat,
    generic shape (not modeling every sub-component the real game
    tracks) since the UDP CarDamageData layout hasn't been verified the
    same rigorous way CarTelemetryData/CarSetupData were - see
    telemetry/parsers/f1_2024.py's docstring for that verification
    process. This can grow more granular once that verification happens
    without changing any advisor's public interface."""

    front_wing_pct: float = 0.0
    rear_wing_pct: float = 0.0
    floor_pct: float = 0.0
    diffuser_pct: float = 0.0
    sidepod_pct: float = 0.0

    @property
    def max_damage_pct(self) -> float:
        return max(
            self.front_wing_pct,
            self.rear_wing_pct,
            self.floor_pct,
            self.diffuser_pct,
            self.sidepod_pct,
        )


@dataclass(frozen=True)
class DRSContext:
    enabled: bool  # race control has enabled DRS this session (false for first 2 laps, wet, etc.)
    in_zone: bool  # car is physically within a DRS activation zone right now
    gap_to_car_ahead_s: float | None  # None if no car ahead within range
    detection_gap_threshold_s: float = 1.0


@dataclass
class EngineerSessionState:
    """Everything the advisory engine reads from - the "session state"
    half of "consume telemetry events and session state". Built by the
    caller from whatever mix of live telemetry, DB records, and race
    control events is available; the engine itself has no idea where
    any of this came from."""

    current_lap: int
    total_laps: int
    tyre_state: TyreState
    fuel_state: FuelState
    ers_state: ERSState
    drs: DRSContext
    track_status: TrackStatus
    weather: WeatherCondition
    weather_forecast: list[WeatherCondition] = field(default_factory=list)
    car_damage: CarDamageState = field(default_factory=CarDamageState)
    gap_to_car_ahead_s: float | None = None
    gap_to_car_behind_s: float | None = None  # needed for push/conserve: attack ahead vs. defend behind
