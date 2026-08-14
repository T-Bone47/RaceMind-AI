"""Updates a driver's long-term `DriverProfile` scores from
completed-session data.

Pure functions over aggregate stats - no DB or LLM calls here, so this
is trivial to unit test. `blend()` folds a new session into the running
score with an exponential moving average, which is the "online
learning" approach from the project roadmap without needing a real ML
pipeline for v1.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass

_LAP_TIME_CV_FOR_ZERO_SCORE = 0.05  # 5% lap-to-lap variance maps to a 0 consistency score
_BASELINE_WEAR_PCT_PER_LAP = 3.0  # rough "average" degradation rate used as the tyre-management anchor


@dataclass(frozen=True)
class SessionStats:
    lap_times_ms: list[int]
    average_tyre_wear_per_lap_pct: float
    off_track_incidents: int = 0


@dataclass(frozen=True)
class ProfileDelta:
    consistency_score: float
    aggression_score: float
    tyre_management_score: float


def _consistency_from_lap_times(lap_times_ms: list[int]) -> float:
    """0-100, higher = more consistent, based on the coefficient of
    variation of lap times (only meaningful with 2+ laps)."""
    clean = [t for t in lap_times_ms if t > 0]
    if len(clean) < 2:
        return 50.0
    mean = statistics.mean(clean)
    stdev = statistics.pstdev(clean)
    cv = stdev / mean
    score = 100.0 * (1 - cv / _LAP_TIME_CV_FOR_ZERO_SCORE)
    return round(max(0.0, min(100.0, score)), 1)


def _aggression_from_incidents(off_track_incidents: int, laps: int) -> float:
    """0-100 proxy score, not a value judgement - higher off-track/spin
    rate per lap nudges this up. Centered at 50 for zero incidents."""
    if laps == 0:
        return 50.0
    rate = off_track_incidents / laps
    score = 50.0 + rate * 500.0
    return round(max(0.0, min(100.0, score)), 1)


def _tyre_management_from_wear(
    average_wear_per_lap_pct: float, baseline_pct_per_lap: float = _BASELINE_WEAR_PCT_PER_LAP
) -> float:
    """0-100, higher = gentler on tyres relative to the baseline rate."""
    if average_wear_per_lap_pct <= 0:
        return 50.0
    ratio = baseline_pct_per_lap / average_wear_per_lap_pct
    score = 50.0 * ratio
    return round(max(0.0, min(100.0, score)), 1)


def compute_delta(stats: SessionStats) -> ProfileDelta:
    return ProfileDelta(
        consistency_score=_consistency_from_lap_times(stats.lap_times_ms),
        aggression_score=_aggression_from_incidents(stats.off_track_incidents, len(stats.lap_times_ms)),
        tyre_management_score=_tyre_management_from_wear(stats.average_tyre_wear_per_lap_pct),
    )


def blend(current_score: float, new_sample: float, session_weight: float = 0.2) -> float:
    """Exponential moving average - one session nudges the long-term
    profile rather than overwriting it."""
    return round(current_score * (1 - session_weight) + new_sample * session_weight, 1)
