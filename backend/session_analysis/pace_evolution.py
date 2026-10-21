"""Pace evolution across a session: lap-time trend (are laps getting
faster or slower as the run progresses) and fuel consumption trend (is
the reported burn rate rising or falling). Grouped in one module since
both are session-wide, continuous trends - unlike tyre wear, which
resets every stint (see stint_analysis.py).

Both use a simple first-half-vs-second-half average comparison rather
than a fitted regression - this project has no numpy/scipy dependency,
and an average-of-halves comparison is easier to explain and less
sensitive to one noisy lap than an endpoint-to-endpoint slope.
"""

from __future__ import annotations

import statistics
from typing import TypeVar

from common.confidence import from_sample_count
from session_analysis.models import FuelTrend, LapRecord, PaceEvolution, TrendDirection
from strategy.fuel import FuelState

T = TypeVar("T")

_STABLE_THRESHOLD_MS_PER_LAP = 50.0  # below this magnitude, call the lap-time trend "stable"
_STABLE_THRESHOLD_KG_PER_LAP = 0.05  # below this magnitude, call the fuel trend "stable"
_MIN_LAPS_FOR_PACE_TREND = 4
_MIN_SAMPLES_FOR_FUEL_TREND = 4
_FULL_CONFIDENCE_LAP_COUNT = 10


def evolve_pace(laps: list[LapRecord]) -> PaceEvolution | None:
    valid = sorted(
        (lap for lap in laps if lap.is_valid and lap.lap_time_ms is not None),
        key=lambda lap: lap.lap_number,
    )
    if len(valid) < _MIN_LAPS_FOR_PACE_TREND:
        return None

    first_half, second_half = _split_in_half(valid)
    first_avg = statistics.fmean(_require_lap_time(lap) for lap in first_half)
    second_avg = statistics.fmean(_require_lap_time(lap) for lap in second_half)
    lap_gap = statistics.fmean(lap.lap_number for lap in second_half) - statistics.fmean(
        lap.lap_number for lap in first_half
    )
    trend = (second_avg - first_avg) / lap_gap if lap_gap > 0 else 0.0

    return PaceEvolution(
        lap_numbers=[lap.lap_number for lap in valid],
        lap_times_ms=[_require_lap_time(lap) for lap in valid],
        direction=_direction(trend, _STABLE_THRESHOLD_MS_PER_LAP),
        trend_ms_per_lap=round(trend, 1),
        confidence=from_sample_count(len(valid), full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT, label="lap"),
    )


def analyze_fuel_trend(fuel_states_by_lap: dict[int, FuelState]) -> FuelTrend | None:
    ordered = sorted(fuel_states_by_lap.items(), key=lambda pair: pair[0])
    if len(ordered) < _MIN_SAMPLES_FOR_FUEL_TREND:
        return None

    rates = [state.consumption_per_lap_kg for _, state in ordered]
    first_half, second_half = _split_in_half(rates)
    trend = statistics.fmean(second_half) - statistics.fmean(first_half)

    return FuelTrend(
        lap_numbers=[lap for lap, _ in ordered],
        consumption_per_lap_kg=[round(r, 3) for r in rates],
        average_consumption_per_lap_kg=round(statistics.fmean(rates), 3),
        direction=_direction(trend, _STABLE_THRESHOLD_KG_PER_LAP),
        confidence=from_sample_count(len(ordered), full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT, label="lap"),
    )


def _split_in_half(items: list[T]) -> tuple[list[T], list[T]]:  # noqa: UP047
    midpoint = len(items) // 2
    return items[:midpoint], items[midpoint:]


def _require_lap_time(lap: LapRecord) -> int:
    assert lap.lap_time_ms is not None  # caller already filtered for this
    return lap.lap_time_ms


def _direction(trend: float, stable_threshold: float) -> TrendDirection:
    if trend <= -stable_threshold:
        return TrendDirection.IMPROVING
    if trend >= stable_threshold:
        return TrendDirection.DEGRADING
    return TrendDirection.STABLE
