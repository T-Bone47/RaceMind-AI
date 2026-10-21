"""Session scoring: a composite 0-100 score blending lap-time
consistency with how clean the session was (valid-lap ratio and
incident count).

Consistency is reused from coaching.consistency_analysis.score(), not
reimplemented - that module already scores "a single session's
coaching report" (its own docstring's words), which is exactly this
package's use case, as opposed to ai.driver_profile's longer-horizon,
cross-session scoring.

analyze_session() is this package's single orchestrating entry point,
mirroring DriverCoach.generate_report() / EngineeringAdvisor.analyze()
/ RaceEngineer.evaluate() elsewhere in the codebase: it composes every
sub-module below into one SessionReport and adds no modeling of its
own beyond the composite score.
"""

from __future__ import annotations

from coaching.consistency_analysis import score as score_consistency
from coaching.models import TelemetrySample
from common.confidence import from_sample_count
from session_analysis.incidents import detect_incidents
from session_analysis.lap_comparison import compare_to_best
from session_analysis.models import Incident, LapRecord, SessionReport, SessionScore
from session_analysis.pace_evolution import analyze_fuel_trend, evolve_pace
from session_analysis.personal_bests import find_personal_bests
from session_analysis.stint_analysis import analyze_stints
from strategy.fuel import FuelState
from strategy.tyre import TyreState

_INCIDENT_PENALTY_POINTS = 8.0  # points deducted from the consistency score per incident
_FULL_CONFIDENCE_LAP_COUNT = 10


def score_session(laps: list[LapRecord], incidents: list[Incident]) -> SessionScore:
    valid_laps = [lap for lap in laps if lap.is_valid]
    lap_times_ms = [lap.lap_time_ms for lap in valid_laps if lap.lap_time_ms is not None]

    consistency = score_consistency(lap_times_ms)
    valid_ratio = round(len(valid_laps) / len(laps), 3) if laps else 0.0

    penalty = min(len(incidents) * _INCIDENT_PENALTY_POINTS, consistency.score_0_100)
    overall = round(consistency.score_0_100 - penalty, 1)

    return SessionScore(
        overall_score_0_100=overall,
        consistency=consistency,
        valid_lap_ratio=valid_ratio,
        incident_count=len(incidents),
        confidence=from_sample_count(len(laps), full_confidence_at=_FULL_CONFIDENCE_LAP_COUNT, label="lap"),
    )


def analyze_session(
    *,
    laps: list[LapRecord],
    tyre_states_by_lap: dict[int, TyreState],
    fuel_states_by_lap: dict[int, FuelState],
    telemetry_by_lap: dict[int, list[TelemetrySample]],
) -> SessionReport:
    incidents = detect_incidents(laps, telemetry_by_lap)

    return SessionReport(
        lap_comparisons=compare_to_best(laps),
        stints=analyze_stints(laps, tyre_states_by_lap),
        fuel_trend=analyze_fuel_trend(fuel_states_by_lap),
        pace_evolution=evolve_pace(laps),
        incidents=incidents,
        personal_bests=find_personal_bests(laps),
        score=score_session(laps, incidents),
    )
