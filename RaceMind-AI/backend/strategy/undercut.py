"""Undercut: pit before a rival to gain track position on fresher tyres.

Simplified model - both cars pay roughly the same pit-lane time loss
eventually, so it mostly cancels out of the comparison. What decides an
undercut is whether the fresh-tyre pace advantage, accumulated over the
laps before the rival also pits, is bigger than the gap you're
currently behind by.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class UndercutInput:
    gap_to_rival_s: float  # positive = rival is ahead by this many seconds
    fresh_tyre_advantage_s_per_lap: float  # expected pace gain on new tyres vs rival's current tyres
    assumed_laps_until_rival_pits: int


@dataclass(frozen=True)
class UndercutAnalysis:
    is_viable: bool
    projected_gain_s: float
    margin_s: float  # positive = comfortably viable, negative = falls short


def analyze(data: UndercutInput) -> UndercutAnalysis:
    projected_gain = data.fresh_tyre_advantage_s_per_lap * max(data.assumed_laps_until_rival_pits, 0)
    margin = projected_gain - data.gap_to_rival_s
    return UndercutAnalysis(
        is_viable=margin > 0,
        projected_gain_s=round(projected_gain, 2),
        margin_s=round(margin, 2),
    )
