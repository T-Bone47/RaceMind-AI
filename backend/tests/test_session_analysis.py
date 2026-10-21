"""Comprehensive tests for session_analysis package.

Mirrors existing test patterns from test_engineer.py and test_strategy_engine.py:
- Frozen dataclasses with value-based assertions
- Organized by module/function with clear docstrings
- Fixture-based lap/state construction to avoid repetition
- Both edge cases (empty, minimal data) and typical scenarios
"""

from __future__ import annotations

import pytest

from coaching.models import TelemetrySample
from common.confidence import fixed
from database.models.enums import TyreCompound
from session_analysis import analyze_session
from session_analysis.incidents import detect_incidents
from session_analysis.lap_comparison import compare_laps, compare_to_best
from session_analysis.models import (
    Incident,
    IncidentType,
    LapRecord,
    SessionReport,
    TrendDirection,
)
from session_analysis.pace_evolution import analyze_fuel_trend, evolve_pace
from session_analysis.personal_bests import find_personal_bests
from session_analysis.session_score import score_session
from session_analysis.stint_analysis import analyze_stints
from strategy.fuel import FuelState
from strategy.tyre import TyreState

# --- Fixtures ---


def _lap(
    number: int,
    time_ms: int | None = 85000,
    s1_ms: int | None = 27000,
    s2_ms: int | None = 30000,
    s3_ms: int | None = 28000,
    is_valid: bool = True,
    compound: TyreCompound | None = TyreCompound.MEDIUM,
    track_pos: int | None = None,
) -> LapRecord:
    return LapRecord(
        lap_number=number,
        lap_time_ms=time_ms,
        sector_1_ms=s1_ms,
        sector_2_ms=s2_ms,
        sector_3_ms=s3_ms,
        is_valid=is_valid,
        tyre_compound=compound,
        track_position=track_pos,
    )


def _tyre_state(wear_pct: float = 10.0, age_laps: int = 2) -> TyreState:
    return TyreState(compound=TyreCompound.MEDIUM, wear_pct=wear_pct, age_laps=age_laps)


def _fuel_state(remaining_kg: float = 30.0, consumption_per_lap_kg: float = 1.5) -> FuelState:
    return FuelState(remaining_kg=remaining_kg, consumption_per_lap_kg=consumption_per_lap_kg)


def _telemetry_samples(lap_distance: float = 5000.0) -> list[TelemetrySample]:
    """Simple straight telemetry with no corners."""
    return [
        TelemetrySample(lap_distance_m=i * 100, speed_kph=300.0, throttle_pct=100.0, brake_pct=0.0, steering=0.0)
        for i in range(int(lap_distance / 100))
    ]


# --- Lap Comparison Tests ---


def test_compare_laps_identical_returns_zero_deltas():
    lap_a = _lap(1, time_ms=85000, s1_ms=27000, s2_ms=30000, s3_ms=28000)
    lap_b = _lap(2, time_ms=85000, s1_ms=27000, s2_ms=30000, s3_ms=28000)

    result = compare_laps(lap_a, lap_b)

    assert result.lap_time_delta_ms == 0
    assert all(s.delta_ms == 0 for s in result.sector_deltas)


def test_compare_laps_slower_lap_b_has_positive_delta():
    lap_a = _lap(1, time_ms=85000, s1_ms=27000, s2_ms=30000, s3_ms=28000)
    lap_b = _lap(2, time_ms=86500, s1_ms=27500, s2_ms=30500, s3_ms=28500)

    result = compare_laps(lap_a, lap_b)

    assert result.lap_time_delta_ms == 1500
    assert result.sector_deltas[0].delta_ms == 500
    assert result.sector_deltas[1].delta_ms == 500
    assert result.sector_deltas[2].delta_ms == 500


def test_compare_laps_with_missing_sectors_returns_none_delta():
    lap_a = _lap(1, time_ms=85000, s1_ms=27000, s2_ms=None, s3_ms=28000)
    lap_b = _lap(2, time_ms=86000, s1_ms=28000, s2_ms=30000, s3_ms=28000)

    result = compare_laps(lap_a, lap_b)

    assert result.sector_deltas[1].delta_ms is None


def test_compare_to_best_returns_empty_with_no_valid_laps():
    laps = [_lap(1, time_ms=None), _lap(2, time_ms=None)]

    result = compare_to_best(laps)

    assert result == []


def test_compare_to_best_excludes_invalid_laps():
    laps = [_lap(1, is_valid=False, time_ms=85000), _lap(2, is_valid=True, time_ms=85500)]

    result = compare_to_best(laps)

    # Only lap 2 is valid, so compare_to_best should have no comparisons (can't compare lap 2 to itself)
    assert len(result) == 0


def test_compare_to_best_compares_all_valid_laps_to_fastest():
    laps = [
        _lap(1, time_ms=85000),
        _lap(2, time_ms=85500),
        _lap(3, time_ms=84500),  # fastest
        _lap(4, time_ms=86000),
    ]

    result = compare_to_best(laps)

    assert len(result) == 3
    assert all(comparison.lap_a.lap_number == 3 for comparison in result)
    assert {c.lap_b.lap_number for c in result} == {1, 2, 4}


# --- Personal Bests Tests ---


def test_find_personal_bests_with_single_lap():
    laps = [_lap(1, time_ms=85000, s1_ms=27000, s2_ms=30000, s3_ms=28000)]

    result = find_personal_bests(laps)

    assert result.best_lap_time_ms == 85000
    assert result.best_lap_number == 1
    assert result.best_sector_1_ms == 27000
    assert result.theoretical_best_lap_ms == 85000


def test_find_personal_bests_excludes_invalid_laps():
    laps = [
        _lap(1, time_ms=85500, s1_ms=27500, is_valid=False),
        _lap(2, time_ms=85000, s1_ms=27000, is_valid=True),
    ]

    result = find_personal_bests(laps)

    assert result.best_lap_time_ms == 85000
    assert result.best_sector_1_ms == 27000


def test_find_personal_bests_with_no_timing_data():
    laps = [_lap(1, time_ms=None, s1_ms=None, s2_ms=None, s3_ms=None)]

    result = find_personal_bests(laps)

    assert result.best_lap_time_ms is None
    assert result.best_sector_1_ms is None
    assert result.theoretical_best_lap_ms is None


def test_find_personal_bests_theoretical_best_across_different_laps():
    laps = [
        _lap(1, time_ms=85000, s1_ms=27000, s2_ms=30500, s3_ms=28000),  # best S1
        _lap(2, time_ms=85500, s1_ms=27500, s2_ms=30000, s3_ms=27500),  # best S2 & S3
    ]

    result = find_personal_bests(laps)

    assert result.best_sector_1_ms == 27000
    assert result.best_sector_2_ms == 30000
    assert result.best_sector_3_ms == 27500
    assert result.theoretical_best_lap_ms == 27000 + 30000 + 27500


# --- Stint Analysis Tests ---


def test_analyze_stints_groups_by_compound():
    laps = [
        _lap(1, compound=TyreCompound.SOFT),
        _lap(2, compound=TyreCompound.SOFT),
        _lap(3, compound=TyreCompound.MEDIUM),
        _lap(4, compound=TyreCompound.MEDIUM),
    ]
    tyre_states = {1: _tyre_state(5.0), 2: _tyre_state(15.0), 3: _tyre_state(5.0), 4: _tyre_state(12.0)}

    result = analyze_stints(laps, tyre_states)

    assert len(result) == 2
    assert result[0].stint_number == 1
    assert result[0].compound == TyreCompound.SOFT
    assert result[0].lap_count == 2
    assert result[1].stint_number == 2
    assert result[1].compound == TyreCompound.MEDIUM
    assert result[1].lap_count == 2


def test_analyze_stints_excludes_none_compound_laps():
    laps = [
        _lap(1, compound=TyreCompound.SOFT),
        _lap(2, compound=None),  # excluded
        _lap(3, compound=TyreCompound.SOFT),
    ]
    tyre_states = {1: _tyre_state(5.0), 3: _tyre_state(10.0)}

    result = analyze_stints(laps, tyre_states)

    assert len(result) == 1
    assert result[0].lap_count == 2
    assert result[0].lap_numbers == [1, 3]


def test_analyze_stints_computes_wear_trend():
    laps = [_lap(i, compound=TyreCompound.MEDIUM) for i in range(1, 5)]
    # Wear progresses 5% -> 10% -> 15% -> 20% over 4 laps = 5% per lap
    tyre_states = {1: _tyre_state(5.0), 2: _tyre_state(10.0), 3: _tyre_state(15.0), 4: _tyre_state(20.0)}

    result = analyze_stints(laps, tyre_states)

    assert len(result) == 1
    stint = result[0]
    assert stint.wear_pct_start == 5.0
    assert stint.wear_pct_end == 20.0
    assert stint.observed_wear_per_lap_pct == pytest.approx(5.0, abs=0.01)


# --- Pace Evolution Tests ---


def test_evolve_pace_insufficient_laps_returns_none():
    laps = [_lap(1), _lap(2), _lap(3)]  # need 4+ for trend

    result = evolve_pace(laps)

    assert result is None


def test_evolve_pace_improving_trend():
    laps = [
        _lap(1, time_ms=86000),
        _lap(2, time_ms=85500),
        _lap(3, time_ms=85000),
        _lap(4, time_ms=84500),
    ]

    result = evolve_pace(laps)

    assert result is not None
    assert result.direction == TrendDirection.IMPROVING
    assert result.trend_ms_per_lap < 0  # negative = improving


def test_evolve_pace_degrading_trend():
    laps = [
        _lap(1, time_ms=84500),
        _lap(2, time_ms=85000),
        _lap(3, time_ms=85500),
        _lap(4, time_ms=86000),
    ]

    result = evolve_pace(laps)

    assert result is not None
    assert result.direction == TrendDirection.DEGRADING
    assert result.trend_ms_per_lap > 0  # positive = degrading


def test_evolve_pace_stable_trend():
    laps = [_lap(i, time_ms=85000) for i in range(1, 5)]

    result = evolve_pace(laps)

    assert result is not None
    assert result.direction == TrendDirection.STABLE
    assert abs(result.trend_ms_per_lap) < 50


def test_analyze_fuel_trend_insufficient_samples_returns_none():
    fuel_states = {1: _fuel_state(consumption_per_lap_kg=1.5), 2: _fuel_state(consumption_per_lap_kg=1.4)}

    result = analyze_fuel_trend(fuel_states)

    assert result is None


def test_analyze_fuel_trend_improving():
    fuel_states = {
        1: _fuel_state(consumption_per_lap_kg=1.8),
        2: _fuel_state(consumption_per_lap_kg=1.7),
        3: _fuel_state(consumption_per_lap_kg=1.6),
        4: _fuel_state(consumption_per_lap_kg=1.5),
    }

    result = analyze_fuel_trend(fuel_states)

    assert result is not None
    assert result.direction == TrendDirection.IMPROVING


# --- Incident Detection Tests ---


def test_detect_incidents_flags_invalid_laps():
    laps = [_lap(1, is_valid=True), _lap(2, is_valid=False)]
    telemetry = {1: _telemetry_samples(), 2: _telemetry_samples()}

    incidents = detect_incidents(laps, telemetry)

    assert len(incidents) == 1
    assert incidents[0].incident_type == IncidentType.INVALID_LAP
    assert incidents[0].lap_number == 2


def test_detect_incidents_returns_empty_with_all_valid_laps():
    laps = [_lap(1, is_valid=True), _lap(2, is_valid=True)]
    telemetry = {1: _telemetry_samples(), 2: _telemetry_samples()}

    incidents = detect_incidents(laps, telemetry)

    # No corners detected in flat telemetry, no invalid laps
    assert len(incidents) == 0


def test_detect_incidents_ignores_missing_telemetry():
    laps = [_lap(1, is_valid=True), _lap(2, is_valid=True)]
    telemetry = {1: _telemetry_samples()}  # lap 2 telemetry missing

    incidents = detect_incidents(laps, telemetry)

    # Should not crash, just skip telemetry analysis for lap 2
    assert incidents == []


# --- Session Score Tests ---


def test_score_session_perfect_consistency_no_incidents():
    laps = [_lap(i, time_ms=85000) for i in range(1, 9)]  # 8 identical laps
    incidents = []

    score = score_session(laps, incidents)

    assert score.overall_score_0_100 == 100.0
    assert score.valid_lap_ratio == 1.0
    assert score.incident_count == 0


def test_score_session_deducts_for_incidents():
    laps = [_lap(i, time_ms=85000) for i in range(1, 9)]
    incidents = [
        Incident(
            lap_number=2,
            incident_type=IncidentType.INVALID_LAP,
            message="test",
            confidence=fixed(0.9, "test fixture"),
        ),
    ]

    score = score_session(laps, incidents)

    # 8-point penalty for 1 incident
    assert score.overall_score_0_100 == 100.0 - 8.0
    assert score.incident_count == 1


def test_score_session_deducts_for_invalid_laps():
    laps = [_lap(i, is_valid=True, time_ms=85000) for i in range(1, 7)]
    laps += [_lap(7, is_valid=False), _lap(8, is_valid=False)]

    score = score_session(laps, [])

    assert score.valid_lap_ratio == pytest.approx(0.75, abs=0.01)


# --- Full Session Analysis Orchestrator Tests ---


def test_analyze_session_with_single_lap():
    laps = [_lap(1)]
    tyre_states = {1: _tyre_state()}
    fuel_states = {1: _fuel_state()}
    telemetry = {1: _telemetry_samples()}

    report = analyze_session(
        laps=laps,
        tyre_states_by_lap=tyre_states,
        fuel_states_by_lap=fuel_states,
        telemetry_by_lap=telemetry,
    )

    assert isinstance(report, SessionReport)
    assert report.lap_comparisons == []  # can't compare single lap to best
    assert len(report.stints) == 1
    assert report.pace_evolution is None  # need 4+ laps
    assert report.fuel_trend is None  # need 4+ samples
    assert report.personal_bests.best_lap_number == 1


def test_analyze_session_with_multiple_valid_laps():
    laps = [_lap(i, time_ms=85000 - i * 100) for i in range(1, 9)]
    tyre_states = {i: _tyre_state(wear_pct=i * 5.0) for i in range(1, 9)}
    fuel_states = {i: _fuel_state(consumption_per_lap_kg=1.5 - i * 0.05) for i in range(1, 9)}
    telemetry = {i: _telemetry_samples() for i in range(1, 9)}

    report = analyze_session(
        laps=laps,
        tyre_states_by_lap=tyre_states,
        fuel_states_by_lap=fuel_states,
        telemetry_by_lap=telemetry,
    )

    assert len(report.lap_comparisons) > 0
    assert len(report.stints) >= 1
    assert report.pace_evolution is not None  # 8 laps, improving trend
    assert report.fuel_trend is not None  # 8 samples, improving trend
    assert report.personal_bests.best_lap_number is not None
    assert report.score.overall_score_0_100 >= 0
