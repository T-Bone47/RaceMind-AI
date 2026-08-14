"""Traffic analysis: would pitting now drop the car into a pack, negating
the strategic benefit of the stop? Dirty air within ~1-2s makes the
following laps' pace unreliable, which is exactly what a fresh-tyre
undercut is trying to avoid.
"""

from __future__ import annotations

from dataclasses import dataclass

DEFAULT_TRAFFIC_THRESHOLD_S = 1.5


@dataclass(frozen=True)
class TrafficAnalysis:
    is_clear_air: bool
    cars_within_threshold: int
    nearest_gap_s: float | None


def analyze(
    nearby_gaps_s: list[float], threshold_s: float = DEFAULT_TRAFFIC_THRESHOLD_S
) -> TrafficAnalysis:
    """`nearby_gaps_s`: signed gaps (seconds) from the projected pit-exit
    position to other cars - negative behind, positive ahead."""
    within_threshold = [gap for gap in nearby_gaps_s if abs(gap) <= threshold_s]
    nearest = min(nearby_gaps_s, key=abs) if nearby_gaps_s else None
    return TrafficAnalysis(
        is_clear_air=len(within_threshold) == 0,
        cars_within_threshold=len(within_threshold),
        nearest_gap_s=round(nearest, 2) if nearest is not None else None,
    )
