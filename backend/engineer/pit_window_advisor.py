"""Pit window advice - built on strategy.pit_window's existing
calculation rather than duplicating that math here."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.fuel import FuelState
from strategy.pit_window import calculate
from strategy.tyre import TyreState, predict_cliff


def analyze(
    *, current_lap: int, total_laps: int, tyre_state: TyreState, fuel_state: FuelState
) -> list[Recommendation]:
    window = calculate(
        current_lap=current_lap, total_laps=total_laps, tyre_state=tyre_state, fuel_state=fuel_state
    )
    # Same underlying cliff prediction pit_window.calculate uses internally -
    # called again here specifically for its confidence value, since
    # PitWindow itself doesn't carry one through.
    cliff = predict_cliff(tyre_state)

    laps_until_optimal = window.optimal_lap - current_lap
    if laps_until_optimal <= 0:
        priority = RecommendationPriority.HIGH
        message = "Pit window is open - box this lap or next."
    elif laps_until_optimal <= 2:
        priority = RecommendationPriority.MEDIUM
        message = f"Pit window opens in {laps_until_optimal} laps - start preparing."
    else:
        priority = RecommendationPriority.INFO
        message = f"Pit window: laps {window.earliest_lap}-{window.latest_lap}, optimal {window.optimal_lap}."

    return [
        Recommendation(
            category=RecommendationCategory.PIT_WINDOW,
            priority=priority,
            confidence=fixed(cliff.confidence, "Derived from the same tyre degradation confidence as the tyre advisor."),
            message=message,
            reasoning=window.reason,
        )
    ]
