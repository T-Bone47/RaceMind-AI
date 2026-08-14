"""Weather-driven compound advice - built on strategy.weather's existing
recommendation logic rather than duplicating that here."""

from __future__ import annotations

from common.confidence import fixed
from database.models.enums import TyreCompound, WeatherCondition
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.weather import recommend

# Covers all three branches below: current weather and, where used, the
# forecast are both direct session-state fields the game reports (not a
# statistical prediction this codebase computes), so this uses the same
# fixed()-based direct-reading approach as ERS/fuel/flags/DRS rather than
# the richness-based confidence tyre/pit_window use. Set slightly below
# their 0.95 because one branch (is_forecast_warning) reports on a
# forecast entry describing a future state, not the present one.
_DIRECT_READING_CONFIDENCE = fixed(
    0.9, "Current weather (and forecast, where used) is direct session-state data, not a computed prediction."
)


def analyze(
    current_weather: WeatherCondition,
    current_compound: TyreCompound,
    forecast: list[WeatherCondition] | None = None,
) -> list[Recommendation]:
    weather_rec = recommend(current_weather, current_compound, forecast)

    if weather_rec.is_forecast_warning:
        return [
            Recommendation(
                category=RecommendationCategory.WEATHER,
                priority=RecommendationPriority.HIGH,
                confidence=_DIRECT_READING_CONFIDENCE,
                message=f"Weather change incoming - prepare for {weather_rec.recommended_compound.value}.",
                reasoning=weather_rec.reason,
            )
        ]

    if weather_rec.is_change_from_current:
        return [
            Recommendation(
                category=RecommendationCategory.WEATHER,
                priority=RecommendationPriority.MEDIUM,
                confidence=_DIRECT_READING_CONFIDENCE,
                message=f"Current tyres don't match conditions - {weather_rec.recommended_compound.value} is the call.",
                reasoning=weather_rec.reason,
            )
        ]

    return [
        Recommendation(
            category=RecommendationCategory.WEATHER,
            priority=RecommendationPriority.INFO,
            confidence=_DIRECT_READING_CONFIDENCE,
            message="Conditions match your tyres - no change needed.",
            reasoning=weather_rec.reason,
        )
    ]
