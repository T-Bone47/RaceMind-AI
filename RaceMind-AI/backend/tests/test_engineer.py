from __future__ import annotations

from database.models.enums import TyreCompound, WeatherCondition
from engineer import damage_advisor, drs_advisor, ers_advisor, flag_advisor, fuel_advisor
from engineer import overcut_advisor as overcut_advisor_module
from engineer import pit_window_advisor as pit_window_advisor_module
from engineer import push_conserve_advisor as push_conserve_advisor_module
from engineer import tyre_advisor as tyre_advisor_module
from engineer import undercut_advisor as undercut_advisor_module
from engineer import weather_advisor as weather_advisor_module
from engineer.advisor import EngineeringAdvisor
from engineer.models import (
    CarDamageState,
    DRSContext,
    EngineerSessionState,
    ERSState,
    RecommendationCategory,
    RecommendationPriority,
    TrackStatus,
    priority_rank,
)
from strategy.fuel import FuelState
from strategy.tyre import TyreState

# --- ERS ---


def test_ers_critical_charge_is_high_priority():
    result = ers_advisor.analyze(ERSState(state_of_charge_pct=5.0, deployment_mode="balanced"))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.HIGH
    assert result[0].category == RecommendationCategory.ERS


def test_ers_low_charge_in_overtake_mode_flags_medium():
    result = ers_advisor.analyze(ERSState(state_of_charge_pct=20.0, deployment_mode="overtake"))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.MEDIUM


def test_ers_full_charge_still_harvesting_flags_low():
    result = ers_advisor.analyze(ERSState(state_of_charge_pct=95.0, deployment_mode="harvest"))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.LOW


def test_ers_normal_charge_produces_no_recommendation():
    result = ers_advisor.analyze(ERSState(state_of_charge_pct=55.0, deployment_mode="balanced"))
    assert result == []


# --- DRS ---


def test_drs_disabled_produces_nothing_even_with_a_close_gap():
    result = drs_advisor.analyze(DRSContext(enabled=False, in_zone=True, gap_to_car_ahead_s=0.3))
    assert result == []


def test_drs_in_zone_within_threshold_is_high_priority():
    result = drs_advisor.analyze(DRSContext(enabled=True, in_zone=True, gap_to_car_ahead_s=0.6))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.HIGH


def test_drs_approaching_zone_within_threshold_is_informational():
    result = drs_advisor.analyze(DRSContext(enabled=True, in_zone=False, gap_to_car_ahead_s=0.8))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.INFO


def test_drs_gap_too_large_produces_nothing():
    result = drs_advisor.analyze(DRSContext(enabled=True, in_zone=True, gap_to_car_ahead_s=2.5))
    assert result == []


def test_drs_no_car_ahead_produces_nothing():
    result = drs_advisor.analyze(DRSContext(enabled=True, in_zone=True, gap_to_car_ahead_s=None))
    assert result == []


# --- Flags / Safety Car ---


def test_green_flag_produces_nothing():
    assert flag_advisor.analyze(TrackStatus.GREEN) == []


def test_yellow_flag_is_high_priority():
    result = flag_advisor.analyze(TrackStatus.YELLOW)
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.HIGH


def test_double_yellow_is_critical():
    result = flag_advisor.analyze(TrackStatus.DOUBLE_YELLOW)
    assert result[0].priority == RecommendationPriority.CRITICAL


def test_safety_car_without_open_pit_window_gives_one_recommendation():
    result = flag_advisor.analyze(TrackStatus.SAFETY_CAR, laps_until_scheduled_pit=15)
    assert len(result) == 1
    assert result[0].category == RecommendationCategory.SAFETY_CAR


def test_safety_car_with_open_pit_window_adds_the_cheap_stop_call():
    result = flag_advisor.analyze(TrackStatus.SAFETY_CAR, laps_until_scheduled_pit=2)
    assert len(result) == 2
    assert any(r.priority == RecommendationPriority.CRITICAL for r in result)
    assert any("free" in r.reasoning or "smaller" in r.reasoning for r in result)


def test_vsc_produces_a_recommendation():
    result = flag_advisor.analyze(TrackStatus.VIRTUAL_SAFETY_CAR)
    assert len(result) == 1
    assert result[0].category == RecommendationCategory.SAFETY_CAR


def test_red_flag_is_critical():
    result = flag_advisor.analyze(TrackStatus.RED)
    assert result[0].priority == RecommendationPriority.CRITICAL


# --- Damage ---


def test_no_damage_produces_nothing():
    assert damage_advisor.analyze(CarDamageState()) == []


def test_minor_damage_is_informational_only():
    result = damage_advisor.analyze(CarDamageState(front_wing_pct=15.0))
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.INFO


def test_significant_front_wing_damage_is_high_priority():
    result = damage_advisor.analyze(CarDamageState(front_wing_pct=45.0))
    assert any(r.priority == RecommendationPriority.HIGH for r in result)


def test_critical_floor_damage_is_critical_priority():
    result = damage_advisor.analyze(CarDamageState(floor_pct=75.0))
    assert any(
        r.priority == RecommendationPriority.CRITICAL and r.category == RecommendationCategory.DAMAGE
        for r in result
    )


def test_multiple_damaged_components_each_produce_their_own_recommendation():
    result = damage_advisor.analyze(CarDamageState(front_wing_pct=40.0, rear_wing_pct=35.0))
    assert len(result) == 2


# --- Tyre (wraps strategy.tyre) ---


def test_tyre_advisor_escalates_priority_as_cliff_approaches():
    healthy = TyreState(compound=TyreCompound.MEDIUM, age_laps=5, wear_pct=20.0)
    worn = TyreState(compound=TyreCompound.MEDIUM, age_laps=20, wear_pct=74.0)

    healthy_result = tyre_advisor_module.analyze(healthy)
    worn_result = tyre_advisor_module.analyze(worn)

    assert priority_rank(worn_result[0].priority) > priority_rank(healthy_result[0].priority)


# --- Fuel (wraps strategy.fuel) ---


def test_fuel_advisor_flags_critical_shortfall():
    state = FuelState(remaining_kg=5.0, consumption_per_lap_kg=2.0)
    result = fuel_advisor.analyze(state, laps_to_finish=10)
    assert result[0].priority == RecommendationPriority.CRITICAL


def test_fuel_advisor_reports_fine_with_healthy_margin():
    state = FuelState(remaining_kg=50.0, consumption_per_lap_kg=1.5)
    result = fuel_advisor.analyze(state, laps_to_finish=10)
    assert result[0].priority == RecommendationPriority.INFO


# --- Pit window (wraps strategy.pit_window) ---


def test_pit_window_advisor_produces_a_recommendation():
    tyre = TyreState(compound=TyreCompound.MEDIUM, age_laps=15, wear_pct=60.0)
    fuel = FuelState(remaining_kg=40.0, consumption_per_lap_kg=1.8)
    result = pit_window_advisor_module.analyze(
        current_lap=20, total_laps=50, tyre_state=tyre, fuel_state=fuel
    )
    assert len(result) == 1
    assert result[0].category == RecommendationCategory.PIT_WINDOW


# --- Weather (wraps strategy.weather) ---


def test_weather_advisor_flags_forecast_change():
    result = weather_advisor_module.analyze(
        WeatherCondition.CLEAR, TyreCompound.MEDIUM, [WeatherCondition.HEAVY_RAIN]
    )
    assert result[0].priority == RecommendationPriority.HIGH


def test_weather_advisor_reports_matched_conditions():
    result = weather_advisor_module.analyze(WeatherCondition.CLEAR, TyreCompound.MEDIUM, [])
    assert result[0].priority == RecommendationPriority.INFO


# --- Undercut (wraps strategy.undercut) ---


def test_undercut_advisor_fires_when_viable():
    # margin = (0.8 * 4) - 2.0 = 1.2 > 0
    result = undercut_advisor_module.analyze(
        gap_to_car_ahead_s=2.0, fresh_tyre_advantage_s_per_lap=0.8, assumed_laps_until_rival_pits=4
    )
    assert len(result) == 1
    assert result[0].category == RecommendationCategory.UNDERCUT
    assert result[0].priority == RecommendationPriority.HIGH


def test_undercut_advisor_silent_when_not_viable():
    result = undercut_advisor_module.analyze(gap_to_car_ahead_s=10.0)
    assert result == []


def test_undercut_advisor_silent_with_no_car_ahead():
    result = undercut_advisor_module.analyze(gap_to_car_ahead_s=None)
    assert result == []


def test_undercut_advisor_uses_race_engineer_defaults_when_not_overridden():
    # Same inputs as test_undercut_viable_when_pace_advantage_exceeds_gap in
    # test_strategy_engine.py, but relying on this advisor's own defaults
    # (0.5 s/lap, 3 laps) instead of passing them explicitly.
    result = undercut_advisor_module.analyze(gap_to_car_ahead_s=1.0)
    assert len(result) == 1  # (0.5 * 3) - 1.0 = 0.5 margin, viable


# --- Overcut (wraps strategy.overcut) ---


def test_overcut_advisor_fires_when_viable():
    # net_swing = 22 - (1.0*2) = 20; margin = 20 - 3 = 17
    result = overcut_advisor_module.analyze(
        gap_to_car_behind_s=3.0,
        pit_lane_time_loss_s=22.0,
        pace_deficit_s_per_lap=1.0,
        extra_laps_before_you_pit=2,
    )
    assert len(result) == 1
    assert result[0].category == RecommendationCategory.OVERCUT


def test_overcut_advisor_silent_when_not_viable():
    result = overcut_advisor_module.analyze(gap_to_car_behind_s=30.0)
    assert result == []


def test_overcut_advisor_silent_with_no_car_behind():
    result = overcut_advisor_module.analyze(gap_to_car_behind_s=None)
    assert result == []


# --- Push/Conserve (original logic - no strategy/ module to wrap) ---


def test_push_conserve_advisor_recommends_attack_when_car_ahead_is_close():
    result = push_conserve_advisor_module.analyze(gap_to_car_ahead_s=0.8, gap_to_car_behind_s=None)
    assert any(r.priority == RecommendationPriority.MEDIUM for r in result)
    assert all(r.category == RecommendationCategory.PUSH_CONSERVE for r in result)


def test_push_conserve_advisor_recommends_defend_when_car_behind_is_close():
    result = push_conserve_advisor_module.analyze(gap_to_car_ahead_s=None, gap_to_car_behind_s=0.5)
    assert any(r.priority == RecommendationPriority.HIGH for r in result)


def test_push_conserve_advisor_recommends_conserve_when_both_gaps_are_comfortable():
    result = push_conserve_advisor_module.analyze(gap_to_car_ahead_s=5.0, gap_to_car_behind_s=5.0)
    assert len(result) == 1
    assert result[0].priority == RecommendationPriority.INFO


def test_push_conserve_advisor_silent_with_no_gap_data_at_all():
    result = push_conserve_advisor_module.analyze(gap_to_car_ahead_s=None, gap_to_car_behind_s=None)
    assert result == []


def test_push_conserve_advisor_flags_both_when_sandwiched():
    result = push_conserve_advisor_module.analyze(gap_to_car_ahead_s=0.8, gap_to_car_behind_s=0.5)
    assert len(result) == 2


# --- Orchestrator ---


def _full_state(**overrides: object) -> EngineerSessionState:
    defaults: dict[str, object] = dict(
        current_lap=20,
        total_laps=50,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=15, wear_pct=60.0),
        fuel_state=FuelState(remaining_kg=40.0, consumption_per_lap_kg=1.8),
        ers_state=ERSState(state_of_charge_pct=55.0),
        drs=DRSContext(enabled=True, in_zone=True, gap_to_car_ahead_s=0.5),
        track_status=TrackStatus.GREEN,
        weather=WeatherCondition.CLEAR,
        weather_forecast=[],
        car_damage=CarDamageState(),
    )
    defaults.update(overrides)
    return EngineerSessionState(**defaults)  # type: ignore[arg-type]


def test_advisor_combines_recommendations_from_every_domain():
    advisor = EngineeringAdvisor()
    result = advisor.analyze(_full_state())

    categories = {r.category for r in result}
    # Every advisor that has *something* to say under a normal green-flag
    # state should be represented - flag_advisor is the only one that's
    # legitimately silent (green flag = nothing to report).
    assert RecommendationCategory.TYRE in categories
    assert RecommendationCategory.FUEL in categories
    assert RecommendationCategory.DRS in categories
    assert RecommendationCategory.PIT_WINDOW in categories
    assert RecommendationCategory.WEATHER in categories


def test_advisor_output_is_sorted_highest_priority_first():
    advisor = EngineeringAdvisor()
    result = advisor.analyze(
        _full_state(
            car_damage=CarDamageState(floor_pct=80.0),  # forces a CRITICAL entry
            ers_state=ERSState(state_of_charge_pct=55.0),  # forces no ERS entry (neutral)
        )
    )

    ranks = [priority_rank(r.priority) for r in result]
    assert ranks == sorted(ranks, reverse=True)
    assert result[0].priority == RecommendationPriority.CRITICAL


def test_advisor_under_safety_car_with_open_window_surfaces_the_cheap_pit_call():
    advisor = EngineeringAdvisor()
    state = _full_state(
        current_lap=29,
        tyre_state=TyreState(compound=TyreCompound.MEDIUM, age_laps=28, wear_pct=76.0),
        track_status=TrackStatus.SAFETY_CAR,
    )
    result = advisor.analyze(state)

    assert any(r.category == RecommendationCategory.SAFETY_CAR for r in result)
    assert result[0].priority == RecommendationPriority.CRITICAL


def test_advisor_wires_up_undercut_overcut_and_push_conserve_when_gaps_are_present():
    """The gap-based advisors are silent under the default _full_state
    fixture (gap_to_car_ahead_s/gap_to_car_behind_s default to None) -
    this proves they're actually registered in analyze(), not just
    correct in isolation."""
    advisor = EngineeringAdvisor()
    result = advisor.analyze(
        _full_state(gap_to_car_ahead_s=1.0, gap_to_car_behind_s=0.5)
    )

    categories = {r.category for r in result}
    assert RecommendationCategory.UNDERCUT in categories
    assert RecommendationCategory.OVERCUT in categories
    assert RecommendationCategory.PUSH_CONSERVE in categories


def test_advisor_gap_based_recommendations_are_absent_with_no_gap_data():
    advisor = EngineeringAdvisor()
    result = advisor.analyze(_full_state())  # gaps default to None

    categories = {r.category for r in result}
    assert RecommendationCategory.UNDERCUT not in categories
    assert RecommendationCategory.OVERCUT not in categories
    assert RecommendationCategory.PUSH_CONSERVE not in categories
