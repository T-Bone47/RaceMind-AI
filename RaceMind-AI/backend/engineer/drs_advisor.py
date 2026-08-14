"""DRS (Drag Reduction System) opportunity advice."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import (
    DRSContext,
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
)

_DIRECT_READING_CONFIDENCE = fixed(
    0.95, "Direct DRS-zone and gap-to-car-ahead telemetry reading, not a prediction."
)


def analyze(drs: DRSContext) -> list[Recommendation]:
    if not drs.enabled:
        return []  # nothing actionable - race control has DRS disabled session-wide

    if drs.in_zone and drs.gap_to_car_ahead_s is not None and drs.gap_to_car_ahead_s <= drs.detection_gap_threshold_s:
        return [
            Recommendation(
                category=RecommendationCategory.DRS,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="DRS available now - deploy.",
                reasoning=(
                    f"{drs.gap_to_car_ahead_s:.2f}s to the car ahead at the detection point, "
                    f"inside the {drs.detection_gap_threshold_s:.1f}s window, and you're in the zone."
                ),
            )
        ]

    if (
        not drs.in_zone
        and drs.gap_to_car_ahead_s is not None
        and drs.gap_to_car_ahead_s <= drs.detection_gap_threshold_s
    ):
        return [
            Recommendation(
                category=RecommendationCategory.DRS,
                priority=RecommendationPriority.INFO,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Inside the DRS window - it'll be there at the next zone if you hold the gap.",
                reasoning=f"{drs.gap_to_car_ahead_s:.2f}s to the car ahead, under the detection threshold.",
            )
        ]

    return []
