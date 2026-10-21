"""DriverCoach: the single entry point that runs corner detection, then
every per-corner analyzer, plus consistency and tyre preservation,
returning one CoachingReport.

Corners are matched across laps by apex-distance proximity (not by
detection index) since corner detection runs independently per lap and
could find a slightly different number of corners lap to lap on a noisy
signal - matching by physical position is more robust than assuming
"corner 4 on lap 2" is the same corner as "corner 4 on lap 5".
"""

from __future__ import annotations

from coaching import (
    braking_analysis,
    consistency_analysis,
    steering_analysis,
    throttle_analysis,
)
from coaching import tyre_preservation as tyre_preservation_module
from coaching.corner_detection import detect_corners
from coaching.models import (
    CoachingReport,
    CornerCoachingTip,
    CornerEvent,
    CornerPhase,
    PhaseFeedback,
    TelemetrySample,
)
from coaching.tyre_preservation import TyreWearSnapshot
from common import confidence

_DEFAULT_CORNER_MATCH_TOLERANCE_M = 50.0
_FULL_CONFIDENCE_LAP_COUNT_AT_CORNER = 5


class DriverCoach:
    def __init__(self, corner_match_tolerance_m: float = _DEFAULT_CORNER_MATCH_TOLERANCE_M) -> None:
        self._tolerance = corner_match_tolerance_m

    def generate_report(
        self,
        *,
        laps: list[list[TelemetrySample]],
        lap_times_ms: list[int],
        tyre_wear_snapshots: list[TyreWearSnapshot],
    ) -> CoachingReport:
        if not laps or not laps[-1]:
            raise ValueError("At least one lap of telemetry samples is required.")

        all_lap_corners = [detect_corners(lap_samples) for lap_samples in laps]
        latest_samples = laps[-1]
        latest_corners = all_lap_corners[-1]
        previous_laps_corners = all_lap_corners[:-1]

        corner_tips = [
            self._build_corner_tip(corner, latest_samples, previous_laps_corners)
            for corner in latest_corners
        ]

        return CoachingReport(
            corner_tips=corner_tips,
            consistency=consistency_analysis.score(lap_times_ms),
            tyre_preservation=tyre_preservation_module.analyze(tyre_wear_snapshots),
        )

    def _build_corner_tip(
        self,
        corner: CornerEvent,
        samples: list[TelemetrySample],
        previous_laps_corners: list[list[CornerEvent]],
    ) -> CornerCoachingTip:
        braking = braking_analysis.analyze(corner, samples)
        throttle = throttle_analysis.analyze(corner, samples)
        steering = steering_analysis.analyze(corner, samples)

        matches = self._match_corner_across_laps(corner, previous_laps_corners)
        phase_confidence = confidence.from_sample_count(
            len(matches) + 1,  # +1 for the current lap itself
            full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT_AT_CORNER,
            label="lap at this corner",
        )

        potential_gain = None
        if matches:
            best_min_speed = max(m.min_speed_kph for m in matches)
            if best_min_speed > corner.min_speed_kph:
                potential_gain = round(best_min_speed - corner.min_speed_kph, 1)

        return CornerCoachingTip(
            corner=corner,
            entry=PhaseFeedback(phase=CornerPhase.ENTRY, message=braking.message, confidence=phase_confidence),
            mid=PhaseFeedback(phase=CornerPhase.MID, message=steering.message, confidence=phase_confidence),
            exit=PhaseFeedback(phase=CornerPhase.EXIT, message=throttle.message, confidence=phase_confidence),
            steering_smoothness_note=steering.message,
            steering_corrections=steering.correction_count,
            potential_gain_kph=potential_gain,
        )

    def _match_corner_across_laps(
        self, corner: CornerEvent, previous_laps_corners: list[list[CornerEvent]]
    ) -> list[CornerEvent]:
        matches: list[CornerEvent] = []
        for lap_corners in previous_laps_corners:
            if not lap_corners:
                continue
            closest = min(lap_corners, key=lambda c: abs(c.apex_distance_m - corner.apex_distance_m))
            if abs(closest.apex_distance_m - corner.apex_distance_m) <= self._tolerance:
                matches.append(closest)
        return matches
