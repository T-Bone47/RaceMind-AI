"""Overcut: stay out longer than a rival to gain track position while
they're stationary in the pits, at the cost of a pace deficit on aging
tyres until you also stop.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class OvercutInput:
    gap_to_rival_s: float  # positive = rival is ahead by this many seconds
    pit_lane_time_loss_s: float  # time the rival loses by stopping now
    pace_deficit_s_per_lap: float  # how much slower you are on aging tyres vs their fresh out-lap pace
    extra_laps_before_you_pit: int


@dataclass(frozen=True)
class OvercutAnalysis:
    is_viable: bool
    net_swing_s: float
    margin_s: float


def analyze(data: OvercutInput) -> OvercutAnalysis:
    accumulated_deficit = data.pace_deficit_s_per_lap * max(data.extra_laps_before_you_pit, 0)
    net_swing = data.pit_lane_time_loss_s - accumulated_deficit
    margin = net_swing - data.gap_to_rival_s
    return OvercutAnalysis(
        is_viable=margin > 0,
        net_swing_s=round(net_swing, 2),
        margin_s=round(margin, 2),
    )
