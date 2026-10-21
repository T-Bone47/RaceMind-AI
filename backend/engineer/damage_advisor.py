"""Car damage assessment advice."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import (
    CarDamageState,
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
)

_CRITICAL_DAMAGE_PCT = 60.0
_SIGNIFICANT_DAMAGE_PCT = 30.0
_MINOR_DAMAGE_PCT = 10.0

# Lower than the 0.95 used for other direct readings (ERS/fuel/flags/DRS):
# damage percentage is still a direct telemetry reading, not a prediction,
# but CarDamageState's own docstring notes CarDamageData's UDP layout
# hasn't been spec-verified the rigorous way CarTelemetryData/LapData were
# (see engineer.models.CarDamageState) - discounted accordingly until that
# verification pass happens.
_DIRECT_READING_CONFIDENCE = fixed(
    0.8, "Direct damage-percentage reading, but CarDamageData's UDP layout isn't spec-verified yet."
)


def analyze(damage: CarDamageState) -> list[Recommendation]:
    recommendations: list[Recommendation] = []

    if damage.front_wing_pct >= _SIGNIFICANT_DAMAGE_PCT:
        priority = (
            RecommendationPriority.CRITICAL
            if damage.front_wing_pct >= _CRITICAL_DAMAGE_PCT
            else RecommendationPriority.HIGH
        )
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.DAMAGE,
                priority=priority,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Front wing damage - box for a repair, front-end grip is compromised.",
                reasoning=f"Front wing at {damage.front_wing_pct:.0f}% damage - direct loss of front downforce.",
            )
        )

    if damage.floor_pct >= _SIGNIFICANT_DAMAGE_PCT:
        priority = (
            RecommendationPriority.CRITICAL
            if damage.floor_pct >= _CRITICAL_DAMAGE_PCT
            else RecommendationPriority.HIGH
        )
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.DAMAGE,
                priority=priority,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Floor damage - overall downforce is down, expect less mid-corner grip.",
                reasoning=f"Floor at {damage.floor_pct:.0f}% damage - affects the whole car's aero platform.",
            )
        )

    if damage.rear_wing_pct >= _SIGNIFICANT_DAMAGE_PCT:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.DAMAGE,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Rear wing damage - reduced top speed and rear stability, box if it's getting worse.",
                reasoning=f"Rear wing at {damage.rear_wing_pct:.0f}% damage.",
            )
        )

    max_damage = damage.max_damage_pct
    if _MINOR_DAMAGE_PCT <= max_damage < _SIGNIFICANT_DAMAGE_PCT and not recommendations:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.DAMAGE,
                priority=RecommendationPriority.INFO,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Minor damage picked up - keep an eye on it, nothing to react to yet.",
                reasoning=f"Peak component damage at {max_damage:.0f}%, below the threshold that costs meaningful pace.",
            )
        )

    return recommendations
