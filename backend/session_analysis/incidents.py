"""Incident detection: two independent signals, deliberately not merged
into one confidence figure.

`LapRecord.is_valid` (mirroring database.models.lap.Lap.is_valid) is
the authoritative signal - the game/parser already flagged the lap
(e.g. a track-limits deletion), so this is reported at high confidence.

Corner-level speed-drop outliers are a softer, lower-confidence signal
built on coaching.corner_detection.detect_corners: a corner where this
lap lost much more speed than any other corner on the same lap can
indicate a spin, off-track moment, or contact - but corner_detection
has no track map and no notion of "normal" for that specific corner, so
this is necessarily a within-lap relative comparison, not a claim about
what should have happened there.

Deliberately does NOT reuse DriverCoach._match_corner_across_laps from
coach.py for a stronger cross-lap version of this check: that method is
private, built for a different purpose (braking/throttle/steering
coaching feedback), and coaching/ is out of scope to modify for this
pass. Same reasoning consistency_analysis.py already documents for why
it stays separate from ai.driver_profile rather than sharing code with
it - a small amount of duplication is preferred over coupling two
independently-evolving modules.
"""

from __future__ import annotations

import statistics

from coaching.corner_detection import detect_corners
from coaching.models import TelemetrySample
from common.confidence import fixed
from session_analysis.models import Incident, IncidentType, LapRecord

_MIN_CORNERS_FOR_OUTLIER_CHECK = 4  # need a few corners to have a meaningful "typical" drop
_OUTLIER_STDEV_MULTIPLIER = 2.0  # a corner's drop must exceed the lap's mean by this many stdevs

_INVALID_LAP_CONFIDENCE = fixed(0.95, "Direct is_valid flag from the session data, not inferred.")
_ANOMALOUS_CORNER_CONFIDENCE = fixed(
    0.3, "Single-lap relative outlier only - no track map or cross-lap confirmation."
)


def detect_incidents(
    laps: list[LapRecord], telemetry_by_lap: dict[int, list[TelemetrySample]]
) -> list[Incident]:
    incidents: list[Incident] = []

    for lap in laps:
        if not lap.is_valid:
            incidents.append(
                Incident(
                    lap_number=lap.lap_number,
                    incident_type=IncidentType.INVALID_LAP,
                    message=f"Lap {lap.lap_number} was flagged invalid.",
                    confidence=_INVALID_LAP_CONFIDENCE,
                )
            )

        samples = telemetry_by_lap.get(lap.lap_number)
        if samples:
            incidents.extend(_corner_outliers(lap.lap_number, samples))

    return incidents


def _corner_outliers(lap_number: int, samples: list[TelemetrySample]) -> list[Incident]:
    corners = detect_corners(samples)
    if len(corners) < _MIN_CORNERS_FOR_OUTLIER_CHECK:
        return []

    drops = [corner.entry_speed_kph - corner.min_speed_kph for corner in corners]
    mean_drop = statistics.fmean(drops)
    stdev_drop = statistics.pstdev(drops)
    if stdev_drop <= 0:
        return []

    threshold = mean_drop + _OUTLIER_STDEV_MULTIPLIER * stdev_drop

    return [
        Incident(
            lap_number=lap_number,
            incident_type=IncidentType.ANOMALOUS_CORNER,
            message=(
                f"Lap {lap_number}: corner at {corner.apex_distance_m:.0f}m lost {drop:.0f}kph, "
                "well beyond this lap's other corners - possible off-track moment or contact."
            ),
            confidence=_ANOMALOUS_CORNER_CONFIDENCE,
        )
        for corner, drop in zip(corners, drops, strict=False)
        if drop > threshold
    ]
