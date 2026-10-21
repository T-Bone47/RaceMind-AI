"""Tyre management advice - built on strategy.tyre's existing cliff
prediction rather than duplicating that math here."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.tyre import TyreState, predict_cliff

_CRITICAL_LAPS_TO_CLIFF = 1
_HIGH_LAPS_TO_CLIFF = 3
_WATCH_LAPS_TO_CLIFF = 6


def analyze(tyre: TyreState) -> list[Recommendation]:
    cliff = predict_cliff(tyre)

    if cliff.laps_to_cliff <= _CRITICAL_LAPS_TO_CLIFF:
        priority = RecommendationPriority.CRITICAL
        message = "Tyres are gone - box this lap."
    elif cliff.laps_to_cliff <= _HIGH_LAPS_TO_CLIFF:
        priority = RecommendationPriority.HIGH
        message = f"Tyre cliff in {cliff.laps_to_cliff} laps - start planning the stop."
    elif cliff.laps_to_cliff <= _WATCH_LAPS_TO_CLIFF:
        priority = RecommendationPriority.MEDIUM
        message = f"Tyres on watch - cliff projected in {cliff.laps_to_cliff} laps."
    else:
        priority = RecommendationPriority.INFO
        message = f"Tyres healthy - {cliff.laps_to_cliff} laps of life left at this rate."

    return [
        Recommendation(
            category=RecommendationCategory.TYRE,
            priority=priority,
            confidence=fixed(
                cliff.confidence,
                f"Degradation rate confidence from {tyre.age_laps} laps of wear data this stint.",
            ),
            message=message,
            reasoning=(
                f"{tyre.compound.value} tyres, {tyre.age_laps} laps old, {tyre.wear_pct:.0f}% worn - "
                f"degrading at {cliff.wear_per_lap_pct:.2f}%/lap "
                f"(confidence {cliff.confidence:.0%})."
            ),
        )
    ]
