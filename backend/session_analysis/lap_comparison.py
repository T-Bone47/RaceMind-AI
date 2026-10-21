"""Lap and sector comparison - compare two laps sector by sector, or
every lap in a session against whichever lap was fastest.
"""

from __future__ import annotations

from session_analysis.models import LapComparison, LapRecord, SectorDelta


def compare_laps(lap_a: LapRecord, lap_b: LapRecord) -> LapComparison:
    sector_deltas = [
        _sector_delta(1, lap_a.sector_1_ms, lap_b.sector_1_ms),
        _sector_delta(2, lap_a.sector_2_ms, lap_b.sector_2_ms),
        _sector_delta(3, lap_a.sector_3_ms, lap_b.sector_3_ms),
    ]
    lap_time_delta = (
        lap_b.lap_time_ms - lap_a.lap_time_ms
        if lap_a.lap_time_ms is not None and lap_b.lap_time_ms is not None
        else None
    )
    return LapComparison(
        lap_a=lap_a, lap_b=lap_b, sector_deltas=sector_deltas, lap_time_delta_ms=lap_time_delta
    )


def compare_to_best(laps: list[LapRecord]) -> list[LapComparison]:
    """Every valid, timed lap compared against the session's fastest
    valid lap. Excludes the best lap from the output (comparing it to
    itself is a no-op)."""
    valid = [lap for lap in laps if lap.is_valid and lap.lap_time_ms is not None]
    if not valid:
        return []
    best = min(valid, key=_require_lap_time)
    return [compare_laps(best, lap) for lap in valid if lap.lap_number != best.lap_number]


def _sector_delta(sector: int, a_ms: int | None, b_ms: int | None) -> SectorDelta:
    delta = b_ms - a_ms if a_ms is not None and b_ms is not None else None
    return SectorDelta(sector=sector, lap_a_ms=a_ms, lap_b_ms=b_ms, delta_ms=delta)


def _require_lap_time(lap: LapRecord) -> int:
    assert lap.lap_time_ms is not None  # caller already filtered for this
    return lap.lap_time_ms
