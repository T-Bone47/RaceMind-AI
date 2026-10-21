"""Push/conserve advice - unlike undercut/overcut (which wrap
strategy.undercut/strategy.overcut), there's no strategy.push_conserve
module to build on. This domain logic is original to this advisor, the
same way ers_advisor/drs_advisor/flag_advisor/damage_advisor reason
directly from state rather than wrapping a strategy/ module - simple
threshold reasoning over gap_to_car_ahead_s/gap_to_car_behind_s, not
cross-checked against any external spec since there's nothing to check
it against.
"""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority

_ATTACK_GAP_THRESHOLD_S = 1.5  # car ahead within this = worth pushing to attack
_DEFEND_GAP_THRESHOLD_S = 1.0  # car behind within this = worth pushing to defend

_DIRECT_READING_CONFIDENCE = fixed(0.95, "Direct gap-to-car telemetry reading, not a prediction.")


def analyze(
    *, gap_to_car_ahead_s: float | None, gap_to_car_behind_s: float | None
) -> list[Recommendation]:
    recommendations: list[Recommendation] = []

    attacking = gap_to_car_ahead_s is not None and gap_to_car_ahead_s <= _ATTACK_GAP_THRESHOLD_S
    if attacking:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.PUSH_CONSERVE,
                priority=RecommendationPriority.MEDIUM,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Push now - car ahead is in range, close the gap.",
                reasoning=f"{gap_to_car_ahead_s:.1f}s to the car ahead - within attacking range.",
            )
        )

    defending = gap_to_car_behind_s is not None and gap_to_car_behind_s <= _DEFEND_GAP_THRESHOLD_S
    if defending:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.PUSH_CONSERVE,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Push to defend - car behind is in range.",
                reasoning=f"{gap_to_car_behind_s:.1f}s to the car behind - close enough to attack you.",
            )
        )

    have_data = gap_to_car_ahead_s is not None or gap_to_car_behind_s is not None
    if not attacking and not defending and have_data:
        recommendations.append(
            Recommendation(
                category=RecommendationCategory.PUSH_CONSERVE,
                priority=RecommendationPriority.INFO,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Gap's comfortable both sides - conserve tyres and fuel here.",
                reasoning="Neither the car ahead nor behind is close enough to force a push.",
            )
        )

    return recommendations
