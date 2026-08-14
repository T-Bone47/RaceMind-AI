from __future__ import annotations

from coaching import braking_analysis, consistency_analysis, steering_analysis, throttle_analysis
from coaching import tyre_preservation as tyre_preservation_module
from coaching.corner_detection import detect_corners
from coaching.models import TelemetrySample
from coaching.tyre_preservation import TyreWearSnapshot
from tests.coaching_fixtures import corner, lap, straight

# --- Corner detection ---


def test_detects_a_clear_corner_between_two_straights():
    lap_samples = lap(
        straight(0, 300),
        corner(200, entry_speed=300, apex_speed=90, exit_speed=280),
        straight(340, 280),
    )
    corners = detect_corners(lap_samples)

    assert len(corners) == 1
    assert 80 <= corners[0].min_speed_kph <= 100


def test_ignores_a_small_speed_dip_with_no_steering_as_noise():
    lap_samples = lap(
        straight(0, 300),
        corner(200, entry_speed=300, apex_speed=295, exit_speed=300, steering_peak=0.0),  # tiny dip, no steering
        straight(340, 300),
    )
    corners = detect_corners(lap_samples)
    assert corners == []


def test_requires_steering_corroboration_even_for_a_big_speed_drop():
    """A big speed drop with no steering (e.g. a straight-line lift for
    traffic) should not be reported as a corner."""
    lap_samples = lap(
        straight(0, 300),
        corner(200, entry_speed=300, apex_speed=100, exit_speed=280, steering_peak=0.0),
        straight(340, 280),
    )
    corners = detect_corners(lap_samples)
    assert corners == []


def test_detects_multiple_corners_in_sequence():
    lap_samples = lap(
        straight(0, 300),
        corner(200, entry_speed=300, apex_speed=90, exit_speed=250),
        straight(340, 250, length=100),
        corner(440, entry_speed=250, apex_speed=120, exit_speed=290),
        straight(580, 290),
    )
    corners = detect_corners(lap_samples)
    assert len(corners) == 2
    assert corners[0].index == 1
    assert corners[1].index == 2
    assert corners[1].apex_distance_m > corners[0].apex_distance_m


def test_flat_lap_with_no_corners_returns_empty_list():
    lap_samples = straight(0, 300, length=1000, steps=50)
    assert detect_corners(lap_samples) == []


def test_too_few_samples_returns_empty_list_without_erroring():
    assert detect_corners([]) == []
    assert detect_corners([TelemetrySample(0, 200, 100, 0, 0)]) == []


# --- Braking analysis ---


def test_braking_analysis_detects_trail_braking():
    lap_samples = lap(straight(0, 300), corner(200, 300, 90, 280, trail_brake=True))
    detected_corner = detect_corners(lap_samples)[0]
    insight = braking_analysis.analyze(detected_corner, lap_samples)

    assert insight.is_trail_braking
    assert insight.brake_point_distance_m is not None


def test_braking_analysis_detects_early_release():
    lap_samples = lap(straight(0, 300), corner(200, 300, 90, 280, trail_brake=False))
    detected_corner = detect_corners(lap_samples)[0]
    insight = braking_analysis.analyze(detected_corner, lap_samples)

    assert not insight.is_trail_braking


def test_brake_point_consistency_reports_spread():
    assert braking_analysis.brake_point_consistency_m([100.0, 105.0, 98.0]) == 7.0


def test_brake_point_consistency_needs_at_least_two_points():
    assert braking_analysis.brake_point_consistency_m([100.0]) is None
    assert braking_analysis.brake_point_consistency_m([]) is None


# --- Throttle analysis ---


def test_throttle_analysis_reports_clean_exit():
    lap_samples = lap(straight(0, 300), corner(200, 300, 90, 280, exit_oscillation=False))
    detected_corner = detect_corners(lap_samples)[0]
    insight = throttle_analysis.analyze(detected_corner, lap_samples)

    assert insight.oscillation_count == 0
    assert "Clean exit" in insight.message


def test_throttle_analysis_flags_oscillation():
    lap_samples = lap(straight(0, 300), corner(200, 300, 90, 280, exit_oscillation=True))
    detected_corner = detect_corners(lap_samples)[0]
    insight = throttle_analysis.analyze(detected_corner, lap_samples)

    assert insight.oscillation_count >= 2
    assert "correction" in insight.message


# --- Steering analysis ---


def test_steering_analysis_reports_clean_single_input():
    lap_samples = lap(straight(0, 300), corner(200, 300, 90, 280))
    detected_corner = detect_corners(lap_samples)[0]
    insight = steering_analysis.analyze(detected_corner, lap_samples)

    assert insight.correction_count == 0
    assert "clean" in insight.message.lower() or "committed" in insight.message.lower()


def test_steering_analysis_detects_corrections_from_oscillating_input():
    # Build a corner with a genuinely oscillating steering trace, not the
    # smooth taper corner() produces by default.
    oscillating_samples = []
    for i in range(20):
        distance = 200 + i * 5
        steering = 0.4 if i % 4 < 2 else -0.4
        oscillating_samples.append(
            TelemetrySample(lap_distance_m=distance, speed_kph=100, throttle_pct=0, brake_pct=0, steering=steering)
        )
    lap_samples = lap(straight(0, 300), oscillating_samples, straight(300, 280))
    corners = detect_corners(lap_samples)
    assert corners  # sanity - the dip should still register as a corner
    insight = steering_analysis.analyze(corners[0], lap_samples)
    assert insight.correction_count >= 1


# --- Consistency ---


def test_consistency_score_high_for_tight_lap_times():
    result = consistency_analysis.score([87000, 87050, 86980, 87020, 87010])
    assert result.score_0_100 > 90


def test_consistency_score_low_for_scattered_lap_times():
    result = consistency_analysis.score([85000, 89000, 83000, 91000])
    assert result.score_0_100 < 50


def test_consistency_score_handles_insufficient_data_gracefully():
    result = consistency_analysis.score([87000])
    assert result.lap_count == 1
    assert result.confidence.value < 1.0


def test_consistency_filters_out_invalid_zero_lap_times():
    result = consistency_analysis.score([87000, 0, 87100, 0, 87050])
    assert result.lap_count == 3


# --- Tyre preservation ---


def test_even_wear_produces_no_action_needed_tip():
    snapshots = [TyreWearSnapshot(age_laps=10, wear_fl_pct=40, wear_fr_pct=41, wear_rl_pct=39, wear_rr_pct=40)]
    tips = tyre_preservation_module.analyze(snapshots)
    assert len(tips) == 1
    assert "even" in tips[0].message.lower()


def test_front_heavy_wear_flags_front_specific_advice():
    snapshots = [TyreWearSnapshot(age_laps=10, wear_fl_pct=55, wear_fr_pct=56, wear_rl_pct=35, wear_rr_pct=36)]
    tips = tyre_preservation_module.analyze(snapshots)
    assert any("front" in t.message.lower() for t in tips)


def test_left_right_asymmetry_is_flagged():
    snapshots = [TyreWearSnapshot(age_laps=10, wear_fl_pct=55, wear_fr_pct=35, wear_rl_pct=53, wear_rr_pct=33)]
    tips = tyre_preservation_module.analyze(snapshots)
    assert any("left" in t.message.lower() for t in tips)


def test_no_snapshots_returns_empty_list():
    assert tyre_preservation_module.analyze([]) == []
