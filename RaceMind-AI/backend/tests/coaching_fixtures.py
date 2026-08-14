"""Synthetic telemetry generators shared by the coaching test suite.
Factored out here instead of being duplicated across test files, or
imported as "private" underscore-prefixed helpers from one test module
into another.
"""

from __future__ import annotations

from coaching.models import TelemetrySample


def straight(start_distance: float, speed: float, length: float = 200.0, steps: int = 10) -> list[TelemetrySample]:
    return [
        TelemetrySample(
            lap_distance_m=start_distance + (length * i / steps),
            speed_kph=speed,
            throttle_pct=100.0,
            brake_pct=0.0,
            steering=0.0,
        )
        for i in range(steps + 1)
    ]


def corner(
    start_distance: float,
    entry_speed: float,
    apex_speed: float,
    exit_speed: float,
    *,
    length: float = 120.0,
    steps: int = 24,
    steering_peak: float = 0.4,
    exit_oscillation: bool = False,
    trail_brake: bool = True,
) -> list[TelemetrySample]:
    samples = []
    half = steps // 2
    for i in range(steps + 1):
        distance = start_distance + (length * i / steps)
        progress = i / steps
        if i <= half:
            t = i / half if half else 1.0
            speed = entry_speed + (apex_speed - entry_speed) * t
            brake = 80.0 * (1 - t) if trail_brake else (80.0 if t < 0.5 else 0.0)
            throttle = 0.0
        else:
            t = (i - half) / (steps - half) if (steps - half) else 1.0
            speed = apex_speed + (exit_speed - apex_speed) * t
            brake = 0.0
            remaining_steps = steps - i
            if exit_oscillation and remaining_steps > 2:
                throttle = 30.0 if i % 2 == 0 else 70.0
            else:
                throttle = 100.0 * t if not exit_oscillation else 100.0
        steering = steering_peak * max(0.0, 1 - abs(progress - 0.5) * 2)
        samples.append(
            TelemetrySample(
                lap_distance_m=distance, speed_kph=speed, throttle_pct=throttle, brake_pct=brake, steering=steering
            )
        )
    return samples


def lap(*segments: list[TelemetrySample]) -> list[TelemetrySample]:
    combined: list[TelemetrySample] = []
    for segment in segments:
        combined.extend(segment)
    return combined
