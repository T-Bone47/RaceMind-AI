"""Detects corners from the telemetry signal itself: a corner is a local
minimum in the speed trace, deep enough to not be noise, with meaningful
steering input near it (distinguishing an actual corner from a
straight-line lift for traffic or a flat spot in the data).

No track map, no per-circuit corner list, no external data - this is
why it works for any circuit automatically, and why it was built this
way instead of scraping or hand-entering corner positions per track.
"""

from __future__ import annotations

from coaching.models import CornerEvent, TelemetrySample

_MIN_SPEED_DROP_KPH = 15.0  # below this, treat a dip as noise, not a corner
_MIN_STEERING_MAGNITUDE = 0.12  # corroborating evidence this is a real corner, not a straight-line lift
_STEERING_CHECK_WINDOW = 5  # samples either side of the candidate minimum to check for steering input
_EXIT_RECOVERY_FRACTION = 0.92  # corner "ends" once speed recovers to this fraction of the entry speed


def detect_corners(samples: list[TelemetrySample]) -> list[CornerEvent]:
    if len(samples) < 3:
        return []

    corners: list[CornerEvent] = []
    local_max_speed = samples[0].speed_kph
    local_max_index = 0

    i = 1
    while i < len(samples) - 1:
        is_local_min = samples[i].speed_kph <= samples[i - 1].speed_kph and samples[i].speed_kph <= samples[i + 1].speed_kph

        if is_local_min:
            drop = local_max_speed - samples[i].speed_kph
            if drop >= _MIN_SPEED_DROP_KPH and _has_steering_input(samples, i):
                entry_index = local_max_index
                exit_index = _find_exit_index(samples, i, samples[entry_index].speed_kph)
                corners.append(
                    CornerEvent(
                        index=len(corners) + 1,
                        entry_distance_m=samples[entry_index].lap_distance_m,
                        apex_distance_m=samples[i].lap_distance_m,
                        exit_distance_m=samples[exit_index].lap_distance_m,
                        entry_speed_kph=samples[entry_index].speed_kph,
                        min_speed_kph=samples[i].speed_kph,
                        exit_speed_kph=samples[exit_index].speed_kph,
                    )
                )
                # Resume scanning for the next corner from this one's exit,
                # so a slow, bumpy corner exit isn't mistaken for a second
                # corner immediately after.
                i = exit_index
                local_max_speed = samples[i].speed_kph
                local_max_index = i
                continue

        if samples[i].speed_kph >= local_max_speed:
            local_max_speed = samples[i].speed_kph
            local_max_index = i

        i += 1

    return corners


def _has_steering_input(samples: list[TelemetrySample], center_index: int) -> bool:
    start = max(0, center_index - _STEERING_CHECK_WINDOW)
    end = min(len(samples), center_index + _STEERING_CHECK_WINDOW + 1)
    return any(abs(s.steering) >= _MIN_STEERING_MAGNITUDE for s in samples[start:end])


def _find_exit_index(samples: list[TelemetrySample], apex_index: int, entry_speed_kph: float) -> int:
    """Exit is whichever comes first: speed recovering to
    `_EXIT_RECOVERY_FRACTION` of the entry speed (the isolated-corner
    case, with a long straight after), or a local speed peak followed by
    renewed deceleration (the corner-complex case, where the next
    corner's braking starts before the car ever gets back to this
    corner's entry speed). Using only the entry-speed recovery target
    would swallow closely-spaced corners into one, since a corner
    complex often never fully recovers between corners."""
    target_speed = entry_speed_kph * _EXIT_RECOVERY_FRACTION
    peak_speed = samples[apex_index].speed_kph
    peak_index = apex_index

    for j in range(apex_index + 1, len(samples)):
        if samples[j].speed_kph >= target_speed:
            return j
        if samples[j].speed_kph > peak_speed:
            peak_speed = samples[j].speed_kph
            peak_index = j
        elif samples[j].speed_kph < peak_speed - 1e-6:
            return peak_index

    return len(samples) - 1
