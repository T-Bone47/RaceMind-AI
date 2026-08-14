"""Weather impact on tyre choice. Deliberately narrow scope: this module
only answers "wet, dry, or intermediate category", not which dry
compound to run - that's a pace/strategy call made in pit_window.py.
"""

from __future__ import annotations

from dataclasses import dataclass

from database.models.enums import TyreCompound, WeatherCondition

_WEATHER_COMPOUND: dict[WeatherCondition, TyreCompound] = {
    WeatherCondition.CLEAR: TyreCompound.MEDIUM,
    WeatherCondition.LIGHT_CLOUD: TyreCompound.MEDIUM,
    WeatherCondition.OVERCAST: TyreCompound.MEDIUM,
    WeatherCondition.LIGHT_RAIN: TyreCompound.INTERMEDIATE,
    WeatherCondition.HEAVY_RAIN: TyreCompound.WET,
    WeatherCondition.STORM: TyreCompound.WET,
}


@dataclass(frozen=True)
class WeatherRecommendation:
    recommended_compound: TyreCompound
    is_change_from_current: bool
    is_forecast_warning: bool  # true if the CURRENT compound will be wrong soon
    reason: str


def recommend(
    current_weather: WeatherCondition,
    current_compound: TyreCompound,
    forecast: list[WeatherCondition] | None = None,
) -> WeatherRecommendation:
    now_recommended = _WEATHER_COMPOUND[current_weather]
    forecast = forecast or []

    upcoming_mismatch = next(
        (w for w in forecast if _WEATHER_COMPOUND[w] != now_recommended), None
    )

    if upcoming_mismatch is not None:
        return WeatherRecommendation(
            recommended_compound=_WEATHER_COMPOUND[upcoming_mismatch],
            is_change_from_current=_WEATHER_COMPOUND[upcoming_mismatch] != current_compound,
            is_forecast_warning=True,
            reason=f"Forecast shows {upcoming_mismatch.value.replace('_', ' ')} approaching",
        )

    return WeatherRecommendation(
        recommended_compound=now_recommended,
        is_change_from_current=now_recommended != current_compound,
        is_forecast_warning=False,
        reason=f"Current conditions ({current_weather.value.replace('_', ' ')}) call for {now_recommended.value}",
    )
