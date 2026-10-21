"""Steering smoothness through a corner - the proxy this module uses for
racing-line consistency. A single, progressive steering input generally
means a committed, consistent line; multiple corrections mid-corner
generally mean the car (or the line) needed adjusting.

This is explicitly a proxy, not geometric racing-line analysis - that
would need 2D track position (X/Y coordinates), which isn't part of
this system's telemetry model. Steering angle plus lap distance is what
the pipeline actually has, so that's what this reasons about.
"""

from __future__ import annotations

from dataclasses import dataclass

from coaching.models import CornerEvent, TelemetrySample

_DIRECTION_CHANGE_THRESHOLD = 0.05  # steering delta below this is noise, not a real correction


@dataclass(frozen=True)
class SteeringInsight:
    correction_count: int
    peak_steering_magnitude: float
    message: str


def analyze(corner: CornerEvent, samples: list[TelemetrySample]) -> SteeringInsight:
    zone = [s for s in samples if corner.entry_distance_m <= s.lap_distance_m <= corner.exit_distance_m]

    if len(zone) < 3:
        return SteeringInsight(correction_count=0, peak_steering_magnitude=0.0, message="Not enough data through this corner.")

    peak_magnitude = max(abs(s.steering) for s in zone)
    corrections = _count_direction_reversals(zone)

    if corrections == 0:
        message = "Single, committed steering input through the corner - clean line."
    elif corrections == 1:
        message = "One mid-corner correction - the line is close but not fully settled."
    else:
        message = f"{corrections} steering corrections through the corner - the line is inconsistent, likely costing rotation speed."

    return SteeringInsight(correction_count=corrections, peak_steering_magnitude=peak_magnitude, message=message)


def _count_direction_reversals(zone: list[TelemetrySample]) -> int:
    """Counts how many times the *rate of change* of steering reverses
    sign past the noise threshold - a smooth arc into and out of a
    corner has one continuous sweep and possibly one reversal at the
    apex itself (turning in, then unwinding), so reversals beyond that
    baseline are what actually indicate a correction."""
    deltas = [b.steering - a.steering for a, b in zip(zone, zone[1:], strict=False)]
    significant = [d for d in deltas if abs(d) >= _DIRECTION_CHANGE_THRESHOLD]
    if len(significant) < 2:
        return 0

    reversals = 0
    for prev, curr in zip(significant, significant[1:], strict=False):
        if (prev > 0) != (curr > 0):
            reversals += 1

    # One reversal (turn-in -> unwind at the apex) is normal cornering,
    # not a correction - only count reversals beyond that baseline.
    return max(reversals - 1, 0)
