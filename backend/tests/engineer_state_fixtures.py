"""Shared EngineerSessionState builders for voice/intents/ tests - not
a test file itself, matching the established tests/coaching_fixtures.py
pattern for coaching/. Individual tests call build_state() and override
just the fields relevant to what they're checking.
"""

from __future__ import annotations

from database.models.enums import TyreCompound
from engineer.models import (
    CarDamageState,
    DRSContext,
    EngineerSessionState,
    ERSState,
    FuelState,
    TrackStatus,
    TyreState,
    WeatherCondition,
)


def build_state(
    *,
    current_lap: int = 18,
    total_laps: int = 40,
    tyre_state: TyreState | None = None,
    fuel_state: FuelState | None = None,
    ers_state: ERSState | None = None,
    drs: DRSContext | None = None,
    track_status: TrackStatus = TrackStatus.GREEN,
    weather: WeatherCondition = WeatherCondition.CLEAR,
    weather_forecast: list[WeatherCondition] | None = None,
    car_damage: CarDamageState | None = None,
    gap_to_car_ahead_s: float | None = 1.8,
    gap_to_car_behind_s: float | None = 3.2,
) -> EngineerSessionState:
    return EngineerSessionState(
        current_lap=current_lap,
        total_laps=total_laps,
        tyre_state=tyre_state or TyreState(compound=TyreCompound.SOFT, age_laps=10, wear_pct=30.0),
        fuel_state=fuel_state or FuelState(remaining_kg=45.0, consumption_per_lap_kg=1.9),
        ers_state=ers_state or ERSState(state_of_charge_pct=62.0),
        drs=drs or DRSContext(enabled=True, in_zone=False, gap_to_car_ahead_s=gap_to_car_ahead_s),
        track_status=track_status,
        weather=weather,
        weather_forecast=weather_forecast if weather_forecast is not None else [],
        car_damage=car_damage
        or CarDamageState(front_wing_pct=0.0, rear_wing_pct=0.0, floor_pct=0.0, diffuser_pct=0.0, sidepod_pct=0.0),
        gap_to_car_ahead_s=gap_to_car_ahead_s,
        gap_to_car_behind_s=gap_to_car_behind_s,
    )
