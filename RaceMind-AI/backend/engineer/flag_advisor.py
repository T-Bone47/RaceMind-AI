"""Track status advice - yellow flags, Safety Car, VSC, red flag.

Safety Car / VSC pit-strategy reasoning is genuine, well-known race
strategy (pitting under a full-course caution costs far less time than
a green-flag stop, since the whole field is running slower or under a
fixed delta) - not a guess specific to any one game or season.
"""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import (
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
    TrackStatus,
)

_DIRECT_READING_CONFIDENCE = fixed(
    0.95, "Track status is a direct race-control/session-state reading, not inferred."
)


def analyze(status: TrackStatus, *, laps_until_scheduled_pit: int | None = None) -> list[Recommendation]:
    if status == TrackStatus.YELLOW:
        return [
            Recommendation(
                category=RecommendationCategory.FLAG,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Yellow flag - lift and coast through the zone, no overtaking.",
                reasoning="Local yellow: an incident or stopped car is in this sector.",
            )
        ]

    if status == TrackStatus.DOUBLE_YELLOW:
        return [
            Recommendation(
                category=RecommendationCategory.FLAG,
                priority=RecommendationPriority.CRITICAL,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Double yellow - be prepared to stop, marshals or a car may be on track.",
                reasoning="Double waved yellow signals a more serious hazard than a single yellow.",
            )
        ]

    if status == TrackStatus.SAFETY_CAR:
        recommendations = [
            Recommendation(
                category=RecommendationCategory.SAFETY_CAR,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Safety Car out - close up, no overtaking, hold position.",
                reasoning="Full-course yellow behind the Safety Car.",
            )
        ]
        if laps_until_scheduled_pit is not None and laps_until_scheduled_pit <= 5:
            recommendations.append(
                Recommendation(
                    category=RecommendationCategory.SAFETY_CAR,
                    priority=RecommendationPriority.CRITICAL,
                    confidence=_DIRECT_READING_CONFIDENCE,
                    message="Box this lap - the Safety Car makes this pit stop nearly free.",
                    reasoning=(
                        "Your pit window was already open within 5 laps, and the whole field is "
                        "running slower behind the Safety Car - the time you lose in the pits "
                        "relative to the cars ahead is far smaller than under green flag racing."
                    ),
                )
            )
        return recommendations

    if status == TrackStatus.VIRTUAL_SAFETY_CAR:
        return [
            Recommendation(
                category=RecommendationCategory.SAFETY_CAR,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="VSC - hold the delta time, don't push, and consider the box if your window is open.",
                reasoning=(
                    "Virtual Safety Car requires holding a fixed delta rather than bunching up "
                    "behind a physical car, but a stop still costs less than under green flag "
                    "conditions since every car on track is slowed the same way."
                ),
            )
        ]

    if status == TrackStatus.RED:
        return [
            Recommendation(
                category=RecommendationCategory.FLAG,
                priority=RecommendationPriority.CRITICAL,
                confidence=_DIRECT_READING_CONFIDENCE,
                message="Red flag - session stopped, return to the pit lane or designated area.",
                reasoning="Red flag halts the session; follow race control instructions.",
            )
        ]

    return []  # green flag - nothing to say
