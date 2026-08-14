"""Throttle application analysis for a corner's exit phase: how quickly
and how smoothly the driver gets back to full throttle after the apex.
"""

from __future__ import annotations

from dataclasses import dataclass

from coaching.models import CornerEvent, TelemetrySample

_FULL_THROTTLE_PCT = 95.0
_OSCILLATION_DELTA_PCT = 15.0  # a frame-to-frame throttle swing bigger than this counts as a "correction"


@dataclass(frozen=True)
class ThrottleInsight:
    distance_to_full_throttle_m: float | None
    oscillation_count: int
    message: str


def analyze(corner: CornerEvent, samples: list[TelemetrySample]) -> ThrottleInsight:
    zone = [s for s in samples if corner.apex_distance_m <= s.lap_distance_m <= corner.exit_distance_m]

    if not zone:
        return ThrottleInsight(
            distance_to_full_throttle_m=None,
            oscillation_count=0,
            message="No throttle data in this corner's exit zone.",
        )

    full_throttle_sample = next((s for s in zone if s.throttle_pct >= _FULL_THROTTLE_PCT), None)
    distance_to_full = (
        full_throttle_sample.lap_distance_m - corner.apex_distance_m if full_throttle_sample else None
    )

    oscillations = 0
    for prev, curr in zip(zone, zone[1:], strict=False):
        if abs(curr.throttle_pct - prev.throttle_pct) >= _OSCILLATION_DELTA_PCT:
            oscillations += 1

    if distance_to_full is None:
        message = "Never reached full throttle before the corner exit - likely more room to feed it in earlier."
    elif oscillations >= 2:
        message = (
            f"Full throttle {distance_to_full:.0f}m past the apex, but {oscillations} on/off corrections - "
            "an unsettled exit is costing more than the late throttle application itself."
        )
    else:
        message = f"Clean exit - full throttle {distance_to_full:.0f}m past the apex with a smooth application."

    return ThrottleInsight(
        distance_to_full_throttle_m=distance_to_full,
        oscillation_count=oscillations,
        message=message,
    )
