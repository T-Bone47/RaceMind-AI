"""Overcut opportunity advice - built on strategy.overcut's existing
viability calculation rather than duplicating that math here.

pit_lane_time_loss_s, pace_deficit_s_per_lap, and extra_laps_before_you_pit
aren't on EngineerSessionState, so - same as undercut_advisor.py - this
reuses the exact default assumptions strategy.race_engineer.RaceState
already established for the same inputs.

Flagged deviation from RaceState's behavior: RaceState only evaluates an
overcut when a live `car_behind_is_pitting` signal is true.
EngineerSessionState has no such field, and adding one is a schema
change outside this pass's scope - so this instead treats overcut the
same forward-looking way undercut_advisor.py already does, assuming the
car behind pits in about extra_laps_before_you_pit laps rather than
requiring a confirmed pit event. Worth revisiting if a live pit-event
signal becomes available.
"""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.overcut import OvercutInput
from strategy.overcut import analyze as overcut_analyze

# Mirrors strategy.race_engineer.RaceState's defaults for the same inputs.
_DEFAULT_PIT_LANE_TIME_LOSS_S = 22.0
_DEFAULT_PACE_DEFICIT_S_PER_LAP = 0.3
_DEFAULT_EXTRA_LAPS_BEFORE_YOU_PIT = 2

_ASSUMPTION_CONFIDENCE = fixed(
    0.4,
    "Gap to the car behind is measured, but pit-lane time loss, pace deficit, and "
    "when they'll pit are default assumptions, not live opponent data.",
)


def analyze(
    *,
    gap_to_car_behind_s: float | None,
    pit_lane_time_loss_s: float = _DEFAULT_PIT_LANE_TIME_LOSS_S,
    pace_deficit_s_per_lap: float = _DEFAULT_PACE_DEFICIT_S_PER_LAP,
    extra_laps_before_you_pit: int = _DEFAULT_EXTRA_LAPS_BEFORE_YOU_PIT,
) -> list[Recommendation]:
    if gap_to_car_behind_s is None:
        return []

    result = overcut_analyze(
        OvercutInput(
            gap_to_rival_s=gap_to_car_behind_s,
            pit_lane_time_loss_s=pit_lane_time_loss_s,
            pace_deficit_s_per_lap=pace_deficit_s_per_lap,
            extra_laps_before_you_pit=extra_laps_before_you_pit,
        )
    )
    if not result.is_viable:
        return []

    return [
        Recommendation(
            category=RecommendationCategory.OVERCUT,
            priority=RecommendationPriority.MEDIUM,
            confidence=_ASSUMPTION_CONFIDENCE,
            message=f"Stay out - overcut margin {result.margin_s:+.1f}s once they pit.",
            reasoning=(
                f"{gap_to_car_behind_s:.1f}s ahead of the car behind; assuming a "
                f"{pit_lane_time_loss_s:.1f}s pit-lane loss against a "
                f"{pace_deficit_s_per_lap:.1f}s/lap deficit over "
                f"{extra_laps_before_you_pit} more laps projects a "
                f"{result.net_swing_s:.1f}s net swing - {result.margin_s:+.1f}s margin."
            ),
        )
    ]
