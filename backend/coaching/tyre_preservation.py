"""Tyre preservation advice from wear data. Uses the same four-corner
wear shape already tracked by database.models.tyre.TyreStint - this
module accepts a plain snapshot rather than the ORM model directly to
stay decoupled from the database layer, matching every other analyzer
here.
"""

from __future__ import annotations

from dataclasses import dataclass

from coaching.models import TyrePreservationTip
from common.confidence import from_sample_count

_ASYMMETRY_THRESHOLD_PCT = 8.0  # front-vs-rear or left-vs-right gap beyond this is worth flagging
_FULL_CONFIDENCE_STINT_COUNT = 3


@dataclass(frozen=True)
class TyreWearSnapshot:
    age_laps: int
    wear_fl_pct: float
    wear_fr_pct: float
    wear_rl_pct: float
    wear_rr_pct: float


def analyze(snapshots: list[TyreWearSnapshot]) -> list[TyrePreservationTip]:
    if not snapshots:
        return []

    latest = snapshots[-1]
    confidence = from_sample_count(len(snapshots), full_confidence_at=_FULL_CONFIDENCE_STINT_COUNT, label="wear sample")

    tips: list[TyrePreservationTip] = []

    front_avg = (latest.wear_fl_pct + latest.wear_fr_pct) / 2
    rear_avg = (latest.wear_rl_pct + latest.wear_rr_pct) / 2
    if front_avg - rear_avg >= _ASYMMETRY_THRESHOLD_PCT:
        tips.append(
            TyrePreservationTip(
                message="Fronts are going off faster than the rears - ease the initial turn-in speed into slow corners.",
                reasoning=f"Front average {front_avg:.0f}% vs rear average {rear_avg:.0f}% at {latest.age_laps} laps.",
                confidence=confidence,
            )
        )
    elif rear_avg - front_avg >= _ASYMMETRY_THRESHOLD_PCT:
        tips.append(
            TyrePreservationTip(
                message="Rears are going off faster than the fronts - smoother throttle application on exit will help.",
                reasoning=f"Rear average {rear_avg:.0f}% vs front average {front_avg:.0f}% at {latest.age_laps} laps.",
                confidence=confidence,
            )
        )

    left_avg = (latest.wear_fl_pct + latest.wear_rl_pct) / 2
    right_avg = (latest.wear_fr_pct + latest.wear_rr_pct) / 2
    if abs(left_avg - right_avg) >= _ASYMMETRY_THRESHOLD_PCT:
        heavier_side = "left" if left_avg > right_avg else "right"
        tips.append(
            TyrePreservationTip(
                message=(
                    f"{heavier_side.title()}-side tyres wearing noticeably faster - could be the track's corner "
                    "mix, or heavier loading through one direction than the other."
                ),
                reasoning=f"Left average {left_avg:.0f}% vs right average {right_avg:.0f}%.",
                confidence=confidence,
            )
        )

    if not tips:
        tips.append(
            TyrePreservationTip(
                message="Wear is even across all four corners - no driving-style change needed here.",
                reasoning=f"All corners within {_ASYMMETRY_THRESHOLD_PCT:.0f}% of each other at {latest.age_laps} laps.",
                confidence=confidence,
            )
        )

    return tips
