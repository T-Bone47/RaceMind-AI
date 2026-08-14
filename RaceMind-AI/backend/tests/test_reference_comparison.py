from __future__ import annotations

from reference.comparison import LiveLapSummary, compare_to_reference, summarize
from reference.fastf1_client import ReferenceLap


def _reference_lap(**overrides: object) -> ReferenceLap:
    defaults: dict[str, object] = dict(
        driver="VER",
        driver_number="1",
        team="Red Bull Racing",
        lap_time_s=86.5,
        sector_1_s=28.0,
        sector_2_s=31.0,
        sector_3_s=27.5,
        compound="SOFT",
        tyre_life_laps=3.0,
        speed_trap_kph=331.2,
        year=2024,
        event_name="British Grand Prix",
        session_name="Qualifying",
    )
    defaults.update(overrides)
    return ReferenceLap(**defaults)  # type: ignore[arg-type]


def test_live_lap_slower_than_reference_reports_positive_delta():
    live = LiveLapSummary(lap_time_s=88.0, sector_1_s=28.5, sector_2_s=31.8, sector_3_s=27.7, compound="soft")
    result = compare_to_reference(live, _reference_lap())

    assert result.lap_time_delta_s == round(88.0 - 86.5, 3)
    assert result.lap_time_delta_s > 0
    assert result.sector_deltas[0].delta_s == round(28.5 - 28.0, 3)


def test_live_lap_faster_than_reference_reports_negative_delta():
    live = LiveLapSummary(lap_time_s=85.9, sector_1_s=27.8, sector_2_s=30.9, sector_3_s=27.2, compound="soft")
    result = compare_to_reference(live, _reference_lap())

    assert result.lap_time_delta_s < 0
    assert "quicker" in summarize(result)


def test_missing_sector_data_yields_none_delta_not_zero():
    live = LiveLapSummary(lap_time_s=87.0, sector_1_s=None, sector_2_s=31.5, sector_3_s=27.6, compound="soft")
    result = compare_to_reference(live, _reference_lap())

    assert result.sector_deltas[0].delta_s is None
    assert result.sector_deltas[1].delta_s is not None


def test_different_compound_produces_a_note():
    live = LiveLapSummary(lap_time_s=88.0, sector_1_s=None, sector_2_s=None, sector_3_s=None, compound="medium")
    result = compare_to_reference(live, _reference_lap(compound="SOFT"))

    assert result.compound_note is not None
    assert "Soft" in result.compound_note


def test_matching_compound_has_no_note():
    live = LiveLapSummary(lap_time_s=88.0, sector_1_s=None, sector_2_s=None, sector_3_s=None, compound="soft")
    result = compare_to_reference(live, _reference_lap(compound="SOFT"))

    assert result.compound_note is None
