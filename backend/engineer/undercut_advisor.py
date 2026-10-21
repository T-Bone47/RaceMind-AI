"""Undercut opportunity advice - built on strategy.undercut's existing
viability calculation rather than duplicating that math here.

strategy.undercut.UndercutInput needs fresh_tyre_advantage_s_per_lap and
assumed_laps_until_rival_pits, neither of which EngineerSessionState
carries (no live opponent-tyre-age telemetry is wired up yet). Rather
than invent new numbers, this reuses the exact default assumptions
strategy.race_engineer.RaceState already established for the same two
inputs, so there's one set of assumptions in the codebase, not two.
"""

from __future__ import annotations

from common.confidence import fixed
from engineer.models import Recommendation, RecommendationCategory, RecommendationPriority
from strategy.undercut import UndercutInput
from strategy.undercut import analyze as undercut_analyze

# Mirrors strategy.race_engineer.RaceState's defaults for the same inputs.
_DEFAULT_FRESH_TYRE_ADVANTAGE_S_PER_LAP = 0.5
_DEFAULT_ASSUMED_LAPS_UNTIL_RIVAL_PITS = 3

_ASSUMPTION_CONFIDENCE = fixed(
    0.4,
    "Gap to the car ahead is measured, but the fresh-tyre pace advantage and "
    "assumed laps-until-rival-pits are default assumptions, not live opponent data.",
)


def analyze(
    *,
    gap_to_car_ahead_s: float | None,
    fresh_tyre_advantage_s_per_lap: float = _DEFAULT_FRESH_TYRE_ADVANTAGE_S_PER_LAP,
    assumed_laps_until_rival_pits: int = _DEFAULT_ASSUMED_LAPS_UNTIL_RIVAL_PITS,
) -> list[Recommendation]:
    if gap_to_car_ahead_s is None:
        return []

    result = undercut_analyze(
        UndercutInput(
            gap_to_rival_s=gap_to_car_ahead_s,
            fresh_tyre_advantage_s_per_lap=fresh_tyre_advantage_s_per_lap,
            assumed_laps_until_rival_pits=assumed_laps_until_rival_pits,
        )
    )
    if not result.is_viable:
        return []

    return [
        Recommendation(
            category=RecommendationCategory.UNDERCUT,
            priority=RecommendationPriority.HIGH,
            confidence=_ASSUMPTION_CONFIDENCE,
            message=f"Undercut live - box this lap, {result.margin_s:+.1f}s margin.",
            reasoning=(
                f"{gap_to_car_ahead_s:.1f}s behind the car ahead; assuming a "
                f"{fresh_tyre_advantage_s_per_lap:.1f}s/lap fresh-tyre advantage over "
                f"~{assumed_laps_until_rival_pits} laps projects a "
                f"{result.projected_gain_s:.1f}s gain - {result.margin_s:+.1f}s margin."
            ),
        )
    ]
