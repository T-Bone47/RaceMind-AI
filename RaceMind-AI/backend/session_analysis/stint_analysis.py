"""Stint analysis: groups laps into continuous same-compound runs and
summarizes tyre wear within each. Grouping is by compound changing
between chronologically adjacent laps, not a global group-by-compound,
so a soft-medium-soft strategy correctly produces three stints rather
than merging the two soft runs.

Laps with no compound data are excluded from grouping entirely (rather
than treated as a stint boundary) - a data gap shouldn't be read as a
tyre change.

Reuses strategy.tyre.TyreState as the per-lap wear sample rather than
inventing a parallel type - see models.py's module docstring.
"""

from __future__ import annotations

import statistics

from common.confidence import from_sample_count
from session_analysis.models import LapRecord, StintSummary
from strategy.tyre import TyreState

_FULL_CONFIDENCE_WEAR_SAMPLE_COUNT = 5


def analyze_stints(laps: list[LapRecord], tyre_states_by_lap: dict[int, TyreState]) -> list[StintSummary]:
    ordered = sorted(laps, key=lambda lap: lap.lap_number)
    groups = _group_by_compound_run(ordered)
    return [
        _summarize_stint(stint_number, group, tyre_states_by_lap)
        for stint_number, group in enumerate(groups, start=1)
    ]


def _group_by_compound_run(laps: list[LapRecord]) -> list[list[LapRecord]]:
    groups: list[list[LapRecord]] = []
    for lap in laps:
        if lap.tyre_compound is None:
            continue
        if groups and groups[-1][-1].tyre_compound == lap.tyre_compound:
            groups[-1].append(lap)
        else:
            groups.append([lap])
    return groups


def _summarize_stint(
    stint_number: int, laps: list[LapRecord], tyre_states_by_lap: dict[int, TyreState]
) -> StintSummary:
    compound = laps[0].tyre_compound
    assert compound is not None  # grouping already excludes None-compound laps

    valid_times = [lap.lap_time_ms for lap in laps if lap.is_valid and lap.lap_time_ms is not None]

    stint_wear_samples = sorted(
        (
            (lap.lap_number, tyre_states_by_lap[lap.lap_number])
            for lap in laps
            if lap.lap_number in tyre_states_by_lap
        ),
        key=lambda pair: pair[0],
    )

    wear_start = stint_wear_samples[0][1].wear_pct if stint_wear_samples else 0.0
    wear_end = stint_wear_samples[-1][1].wear_pct if stint_wear_samples else 0.0

    observed_wear_per_lap = None
    if len(stint_wear_samples) >= 2:
        first_lap, first_state = stint_wear_samples[0]
        last_lap, last_state = stint_wear_samples[-1]
        lap_span = last_lap - first_lap
        if lap_span > 0:
            observed_wear_per_lap = round((last_state.wear_pct - first_state.wear_pct) / lap_span, 3)

    return StintSummary(
        stint_number=stint_number,
        compound=compound,
        lap_numbers=[lap.lap_number for lap in laps],
        lap_count=len(laps),
        average_lap_time_ms=round(statistics.fmean(valid_times), 1) if valid_times else None,
        best_lap_time_ms=min(valid_times) if valid_times else None,
        wear_pct_start=wear_start,
        wear_pct_end=wear_end,
        observed_wear_per_lap_pct=observed_wear_per_lap,
        confidence=from_sample_count(
            len(stint_wear_samples), full_confidence_at=_FULL_CONFIDENCE_WEAR_SAMPLE_COUNT, label="tyre-wear sample"
        ),
    )
