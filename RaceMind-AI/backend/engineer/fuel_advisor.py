"""Fuel strategy advice - built on strategy.fuel's existing projection
rather than duplicating that math here."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.fuel import FuelState, project

_DIRECT_READING_CONFIDENCE = fixed(
    0.95, "Direct fuel-load and consumption-rate telemetry reading, not a prediction."
)


def analyze(fuel: FuelState, *, laps_to_finish: int) -> list[Recommendation]:
    projection = project(fuel, laps_to_finish)

    if projection.is_critical:
        deficit = laps_to_finish - projection.laps_remaining
        return [
            Recommendation(
                category=RecommendationCategory.FUEL,
                priority=RecommendationPriority.CRITICAL,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Fuel critical - lift and coast, save what you can or you won't make the flag.",
                reasoning=(
                    f"{projection.laps_remaining:.1f} laps of fuel at the current rate against "
                    f"{laps_to_finish} laps to the flag - roughly {deficit:.1f} laps short."
                ),
            )
        ]

    margin = projection.laps_remaining - laps_to_finish
    if margin < 2.0:
        return [
            Recommendation(
                category=RecommendationCategory.FUEL,
                priority=RecommendationPriority.MEDIUM,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Fuel margin is tight - short-shift and manage from here.",
                reasoning=(
                    f"{projection.laps_remaining:.1f} laps of range against {laps_to_finish} laps "
                    f"to go - only {margin:.1f} laps of margin."
                ),
            )
        ]

    return [
        Recommendation(
            category=RecommendationCategory.FUEL,
            priority=RecommendationPriority.INFO,
            confidence=_DIRECT_READING_CONFIDENCE,
            message="Fuel's fine - no need to manage it yet.",
            reasoning=f"{projection.laps_remaining:.1f} laps of range with {laps_to_finish} laps to go.",
        )
    ]
