"""ERS (Energy Recovery System) deployment/harvest advice."""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import ERSState, Recommendation, RecommendationCategory, RecommendationPriority

_CRITICAL_SOC_PCT = 10.0
_LOW_SOC_PCT = 25.0
_HIGH_SOC_PCT = 85.0

_DIRECT_READING_CONFIDENCE = fixed(0.95, "Direct ERS state-of-charge telemetry reading, not a prediction.")


def analyze(ers: ERSState) -> list[Recommendation]:
    recommendations: list[Recommendation] = []

    if ers.state_of_charge_pct <= _CRITICAL_SOC_PCT:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.ERS,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="ERS critical - switch to harvest, no more deployment this lap.",
                reasoning=(
                    f"State of charge at {ers.state_of_charge_pct:.0f}% - continuing to deploy "
                    "risks running out mid-corner with no engine braking assist."
                ),
            )
        )
    elif ers.state_of_charge_pct <= _LOW_SOC_PCT and ers.deployment_mode in ("overtake", "hotlap"):
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.ERS,
                priority=RecommendationPriority.MEDIUM,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Drop out of overtake mode - manage the battery back to balanced.",
                reasoning=(
                    f"{ers.state_of_charge_pct:.0f}% state of charge is too low to sustain "
                    f"'{ers.deployment_mode}' mode for more than a lap or two."
                ),
            )
        )
    elif ers.state_of_charge_pct >= _HIGH_SOC_PCT and ers.deployment_mode == "harvest":
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.ERS,
                priority=RecommendationPriority.LOW,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Battery nearly full - you can come off harvest mode.",
                reasoning=(
                    f"{ers.state_of_charge_pct:.0f}% state of charge with more harvesting "
                    "queued risks capping out and wasting recovery."
                ),
            )
        )

    return recommendations
