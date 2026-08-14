"""AI Race Engineer advisory engine: consumes telemetry/session state and
returns a prioritized list of Recommendations across tyre, fuel, ERS,
DRS, pit window, weather, flags/Safety Car, and damage. See advisor.py
for the orchestrating EngineeringAdvisor and models.py for the shared
types every sub-advisor uses.
"""

from engineer.advisor import EngineeringAdvisor
from engineer.models import (
    CarDamageState,
    DRSContext,
    EngineerSessionState,
    ERSState,
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
    TrackStatus,
)

__all__ = [
    "EngineeringAdvisor",
    "EngineerSessionState",
    "Recommendation",
    "RecommendationCategory",
    "RecommendationPriority",
    "TrackStatus",
    "ERSState",
    "DRSContext",
    "CarDamageState",
]
