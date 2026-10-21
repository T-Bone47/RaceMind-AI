from __future__ import annotations

from database.models.enums import TyreCompound, WeatherCondition
from strategy import overcut, undercut
from strategy.fuel import FuelState
from strategy.race_engineer import RaceEngineer, RaceState
from strategy.tyre import TyreState


def test_race_engineer_produces_pit_window():
    engine = RaceEngineer()
    state = RaceState(
        current_lap=20,
        total_laps=50,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=15, wear_pct=60.0),
        fuel_state=FuelState(remaining_kg=40.0, consumption_per_lap_kg=1.8),
        weather=WeatherCondition.CLEAR,
    )
    recommendation = engine.evaluate(state)
    assert state.current_lap <= recommendation.pit_window.optimal_lap <= state.total_laps
    assert recommendation.headline


def test_weather_forecast_warning_overrides_headline():
    engine = RaceEngineer()
    state = RaceState(
        current_lap=10,
        total_laps=50,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=5, wear_pct=20.0),
        fuel_state=FuelState(remaining_kg=80.0, consumption_per_lap_kg=1.5),
        weather=WeatherCondition.CLEAR,
        weather_forecast=[WeatherCondition.HEAVY_RAIN],
    )
    recommendation = engine.evaluate(state)
    assert recommendation.weather.is_forecast_warning
    assert "Weather" in recommendation.headline


def test_undercut_viable_when_pace_advantage_exceeds_gap():
    result = undercut.analyze(
        undercut.UndercutInput(
            gap_to_rival_s=2.0, fresh_tyre_advantage_s_per_lap=0.8, assumed_laps_until_rival_pits=4
        )
    )
    assert result.is_viable
    assert result.margin_s == 1.2


def test_undercut_not_viable_when_gap_too_large():
    result = undercut.analyze(
        undercut.UndercutInput(
            gap_to_rival_s=10.0, fresh_tyre_advantage_s_per_lap=0.5, assumed_laps_until_rival_pits=3
        )
    )
    assert not result.is_viable


def test_overcut_viable_when_pit_loss_exceeds_deficit_and_gap():
    result = overcut.analyze(
        overcut.OvercutInput(
            gap_to_rival_s=3.0,
            pit_lane_time_loss_s=22.0,
            pace_deficit_s_per_lap=1.0,
            extra_laps_before_you_pit=2,
        )
    )
    # net_swing = 22 - (1.0*2) = 20; margin = 20 - 3 = 17
    assert result.is_viable
    assert result.net_swing_s == 20.0
    assert result.margin_s == 17.0


def test_race_engineer_wires_up_overcut_when_car_behind_is_pitting():
    engine = RaceEngineer()
    state = RaceState(
        current_lap=20,
        total_laps=50,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=15, wear_pct=60.0),
        fuel_state=FuelState(remaining_kg=40.0, consumption_per_lap_kg=1.8),
        weather=WeatherCondition.CLEAR,
        gap_to_car_behind_s=3.0,
        car_behind_is_pitting=True,
        pit_lane_time_loss_s=22.0,
        pace_deficit_s_per_lap=1.0,
        extra_laps_before_we_pit=2,
    )
    recommendation = engine.evaluate(state)
    assert recommendation.overcut is not None
    assert recommendation.overcut.is_viable
    assert "overcut" in recommendation.headline.lower()


def test_race_engineer_skips_overcut_when_car_behind_not_pitting():
    engine = RaceEngineer()
    state = RaceState(
        current_lap=20,
        total_laps=50,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=15, wear_pct=60.0),
        fuel_state=FuelState(remaining_kg=40.0, consumption_per_lap_kg=1.8),
        weather=WeatherCondition.CLEAR,
        gap_to_car_behind_s=3.0,
        car_behind_is_pitting=False,
    )
    recommendation = engine.evaluate(state)
    assert recommendation.overcut is None
