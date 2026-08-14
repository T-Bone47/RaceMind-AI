"""Braking analysis for a corner's entry phase: brake point, peak
pressure, and whether the driver is trail-braking (releasing gradually
into the apex) or braking-and-releasing well before turn-in.
"""

from __future__ import annotations

from dataclasses import dataclass

from coaching.models import CornerEvent, TelemetrySample

_BRAKE_THRESHOLD_PCT = 5.0
_TRAIL_BRAKING_PROXIMITY_FRACTION = 0.3  # brake release within the last 30% of entry->apex distance counts as trailing it in


@dataclass(frozen=True)
class BrakingInsight:
    brake_point_distance_m: float | None
    peak_brake_pct: float
    is_trail_braking: bool
    message: str


def analyze(corner: CornerEvent, samples: list[TelemetrySample]) -> BrakingInsight:
    zone = [s for s in samples if corner.entry_distance_m <= s.lap_distance_m <= corner.apex_distance_m]

    if not zone:
        return BrakingInsight(
            brake_point_distance_m=None,
            peak_brake_pct=0.0,
            is_trail_braking=False,
            message="No braking data in this corner's entry zone.",
        )

    braking_samples = [s for s in zone if s.brake_pct >= _BRAKE_THRESHOLD_PCT]
    if not braking_samples:
        return BrakingInsight(
            brake_point_distance_m=None,
            peak_brake_pct=max(s.brake_pct for s in zone),
            is_trail_braking=False,
            message="No meaningful braking detected - likely a lift-and-turn-in corner.",
        )

    brake_point = braking_samples[0].lap_distance_m
    peak_brake = max(s.brake_pct for s in zone)
    release_point = braking_samples[-1].lap_distance_m

    entry_span = max(corner.apex_distance_m - corner.entry_distance_m, 1e-6)
    release_proximity_to_apex = (corner.apex_distance_m - release_point) / entry_span
    is_trailing = release_proximity_to_apex <= _TRAIL_BRAKING_PROXIMITY_FRACTION

    if is_trailing:
        message = "Trail-braking into the apex - carrying brake pressure to help rotate the car."
    else:
        early_release_m = corner.apex_distance_m - release_point
        message = f"Brake released ~{early_release_m:.0f}m before the apex - there may be time on the table trailing it in further."

    return BrakingInsight(
        brake_point_distance_m=brake_point,
        peak_brake_pct=peak_brake,
        is_trail_braking=is_trailing,
        message=message,
    )


def brake_point_consistency_m(brake_points: list[float]) -> float | None:
    """Spread (max-min) of braking points for the *same* corner across
    multiple laps - a large spread means the driver hasn't settled on a
    reference braking point yet."""
    valid = [p for p in brake_points if p is not None]
    if len(valid) < 2:
        return None
    return max(valid) - min(valid)
