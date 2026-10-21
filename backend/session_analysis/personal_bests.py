"""Personal bests: best lap, best individual sector times, and the
theoretical best lap (sum of the best individually-set sectors, even
if no single lap strung them all together - a standard motorsport
stat, not a suggestion those sectors are achievable together).
"""

from __future__ import annotations

from collections.abc import Callable

from session_analysis.models import LapRecord, PersonalBests


def find_personal_bests(laps: list[LapRecord]) -> PersonalBests:
    valid = [lap for lap in laps if lap.is_valid]

    best_lap = _fastest_lap(valid)
    best_s1 = _fastest_sector(valid, lambda lap: lap.sector_1_ms)
    best_s2 = _fastest_sector(valid, lambda lap: lap.sector_2_ms)
    best_s3 = _fastest_sector(valid, lambda lap: lap.sector_3_ms)

    theoretical_best = None
    if best_s1 is not None and best_s2 is not None and best_s3 is not None:
        theoretical_best = best_s1 + best_s2 + best_s3

    return PersonalBests(
        best_lap_time_ms=best_lap.lap_time_ms if best_lap else None,
        best_lap_number=best_lap.lap_number if best_lap else None,
        best_sector_1_ms=best_s1,
        best_sector_2_ms=best_s2,
        best_sector_3_ms=best_s3,
        theoretical_best_lap_ms=theoretical_best,
    )


def _fastest_lap(laps: list[LapRecord]) -> LapRecord | None:
    timed = [lap for lap in laps if lap.lap_time_ms is not None]
    if not timed:
        return None
    return min(timed, key=_require_lap_time)


def _require_lap_time(lap: LapRecord) -> int:
    assert lap.lap_time_ms is not None  # caller already filtered for this
    return lap.lap_time_ms


def _fastest_sector(laps: list[LapRecord], getter: Callable[[LapRecord], int | None]) -> int | None:
    times = [t for lap in laps if (t := getter(lap)) is not None]
    return min(times) if times else None
