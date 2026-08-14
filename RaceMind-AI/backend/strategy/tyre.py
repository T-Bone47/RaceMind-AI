"""Tyre degradation heuristics.

Baseline wear-life figures below are a deterministic v1 - explainable,
testable, and cheap to compute per telemetry tick. They're designed to
be swapped for (or blended with) the LSTM degradation model mentioned in
the project roadmap without changing `predict_cliff`'s signature.
"""

from __future__ import annotations

from dataclasses import dataclass

from database.models.enums import TyreCompound

# Rough laps-of-life at 100% pace before the "cliff" (sudden grip loss),
# used only as a prior when we don't yet have enough in-session wear
# samples to fit a per-driver rate.
BASELINE_LIFE_LAPS: dict[TyreCompound, int] = {
    TyreCompound.SOFT: 18,
    TyreCompound.MEDIUM: 28,
    TyreCompound.HARD: 40,
    TyreCompound.INTERMEDIATE: 25,
    TyreCompound.WET: 30,
}

DEFAULT_CLIFF_WEAR_PCT = 75.0


@dataclass(frozen=True)
class TyreState:
    compound: TyreCompound
    age_laps: int
    wear_pct: float  # 0-100, average of 4 corners


@dataclass(frozen=True)
class CliffPrediction:
    laps_to_cliff: int
    wear_per_lap_pct: float
    confidence: float  # 0-1, higher once we have real in-session samples


def wear_rate_per_lap(state: TyreState) -> float:
    """Observed wear rate if we have enough laps of data, otherwise the
    baseline compound rate."""
    if state.age_laps <= 0:
        return 0.0
    return state.wear_pct / state.age_laps


def predict_cliff(state: TyreState, cliff_wear_pct: float = DEFAULT_CLIFF_WEAR_PCT) -> CliffPrediction:
    observed_rate = wear_rate_per_lap(state)

    if state.age_laps >= 3 and observed_rate > 0:
        rate = observed_rate
        confidence = min(0.5 + state.age_laps * 0.02, 0.95)
    else:
        # Not enough samples yet - fall back to the compound baseline.
        baseline_life = BASELINE_LIFE_LAPS[state.compound]
        rate = cliff_wear_pct / baseline_life
        confidence = 0.3

    remaining_wear = max(cliff_wear_pct - state.wear_pct, 0.0)
    laps_to_cliff = int(remaining_wear / rate) if rate > 0 else BASELINE_LIFE_LAPS[state.compound]

    return CliffPrediction(
        laps_to_cliff=max(laps_to_cliff, 0),
        wear_per_lap_pct=round(rate, 3),
        confidence=round(confidence, 2),
    )
