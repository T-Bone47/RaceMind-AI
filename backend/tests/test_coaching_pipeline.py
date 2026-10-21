from __future__ import annotations

from coaching.coach import DriverCoach
from coaching.models import CornerPhase
from coaching.tyre_preservation import TyreWearSnapshot
from tests.coaching_fixtures import corner, lap, straight


def _sample_lap(apex_speed: float = 90.0) -> list:
    return lap(
        straight(0, 300),
        corner(200, entry_speed=300, apex_speed=apex_speed, exit_speed=280),
        straight(340, 280),
    )


def test_generate_report_produces_one_tip_per_detected_corner():
    coach = DriverCoach()
    report = coach.generate_report(
        laps=[_sample_lap()],
        lap_times_ms=[87000],
        tyre_wear_snapshots=[TyreWearSnapshot(10, 40, 41, 39, 40)],
    )

    assert len(report.corner_tips) == 1
    tip = report.corner_tips[0]
    assert tip.entry.phase == CornerPhase.ENTRY
    assert tip.mid.phase == CornerPhase.MID
    assert tip.exit.phase == CornerPhase.EXIT


def test_generate_report_requires_at_least_one_lap():
    import pytest

    coach = DriverCoach()
    with pytest.raises(ValueError):
        coach.generate_report(laps=[], lap_times_ms=[], tyre_wear_snapshots=[])


def test_potential_gain_is_none_on_a_single_lap_with_nothing_to_compare_against():
    coach = DriverCoach()
    report = coach.generate_report(
        laps=[_sample_lap(apex_speed=90.0)],
        lap_times_ms=[87000],
        tyre_wear_snapshots=[],
    )
    assert report.corner_tips[0].potential_gain_kph is None


def test_potential_gain_reflects_a_faster_previous_lap_at_the_same_corner():
    coach = DriverCoach()
    report = coach.generate_report(
        laps=[
            _sample_lap(apex_speed=95.0),  # lap 1: carried more speed through the corner
            _sample_lap(apex_speed=80.0),  # lap 2 (latest, reported on): slower
        ],
        lap_times_ms=[86800, 87300],
        tyre_wear_snapshots=[],
    )

    tip = report.corner_tips[0]
    assert tip.potential_gain_kph is not None
    assert tip.potential_gain_kph == 15.0  # 95 - 80


def test_potential_gain_is_none_when_the_latest_lap_is_already_the_fastest():
    coach = DriverCoach()
    report = coach.generate_report(
        laps=[_sample_lap(apex_speed=80.0), _sample_lap(apex_speed=95.0)],
        lap_times_ms=[87300, 86800],
        tyre_wear_snapshots=[],
    )
    assert report.corner_tips[0].potential_gain_kph is None


def test_corners_at_very_different_track_positions_are_not_matched_across_laps():
    """A corner near the start of one lap and a corner near the end of
    another shouldn't be treated as "the same corner" just because both
    laps only have one corner each - apex-distance proximity is what
    should gate the match, not just being the Nth corner detected."""
    lap_a = lap(straight(0, 300), corner(200, 300, 90, 280), straight(340, 280, length=2000))
    lap_b = lap(
        straight(0, 300, length=2000),
        corner(2200, entry_speed=300, apex_speed=70, exit_speed=280),
        straight(2340, 280),
    )

    coach = DriverCoach(corner_match_tolerance_m=50.0)
    report = coach.generate_report(
        laps=[lap_a, lap_b], lap_times_ms=[87000, 88000], tyre_wear_snapshots=[]
    )

    assert report.corner_tips[0].potential_gain_kph is None


def test_report_includes_consistency_and_tyre_preservation():
    coach = DriverCoach()
    report = coach.generate_report(
        laps=[_sample_lap()],
        lap_times_ms=[87000, 87050, 86980],
        tyre_wear_snapshots=[TyreWearSnapshot(10, 55, 56, 35, 36)],
    )

    assert report.consistency.lap_count == 3
    assert len(report.tyre_preservation) >= 1


def test_confidence_increases_with_more_laps_at_the_same_corner():
    coach = DriverCoach()

    single_lap_report = coach.generate_report(
        laps=[_sample_lap()], lap_times_ms=[87000], tyre_wear_snapshots=[]
    )
    multi_lap_report = coach.generate_report(
        laps=[_sample_lap(), _sample_lap(), _sample_lap(), _sample_lap()],
        lap_times_ms=[87000, 87010, 87020, 87030],
        tyre_wear_snapshots=[],
    )

    single_confidence = single_lap_report.corner_tips[0].entry.confidence.value
    multi_confidence = multi_lap_report.corner_tips[0].entry.confidence.value
    assert multi_confidence > single_confidence
