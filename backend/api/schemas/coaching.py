"""Response schemas for the Driver Coach report - `coaching.CoachingReport`
and its nested types, translated into the API's Pydantic layer the
same way every other domain/ORM type is (see api/schemas/strategy.py).

Read-only: the report is computed on demand from a session's existing
laps/telemetry/tyre data, nothing new is persisted, so there is no
corresponding `*Create` request schema here.
"""

from __future__ import annotations

from api.schemas.common import ORMBase
from coaching.models import CornerPhase


class ConfidenceRead(ORMBase):
    value: float
    reason: str


class CornerEventRead(ORMBase):
    index: int
    entry_distance_m: float
    apex_distance_m: float
    exit_distance_m: float
    entry_speed_kph: float
    min_speed_kph: float
    exit_speed_kph: float


class PhaseFeedbackRead(ORMBase):
    phase: CornerPhase
    message: str
    confidence: ConfidenceRead


class CornerCoachingTipRead(ORMBase):
    corner: CornerEventRead
    entry: PhaseFeedbackRead
    mid: PhaseFeedbackRead
    exit: PhaseFeedbackRead
    steering_smoothness_note: str
    steering_corrections: int
    potential_gain_kph: float | None


class ConsistencyScoreRead(ORMBase):
    score_0_100: float
    lap_time_stdev_ms: float
    lap_count: int
    confidence: ConfidenceRead


class TyrePreservationTipRead(ORMBase):
    message: str
    reasoning: str
    confidence: ConfidenceRead


class CoachingReportRead(ORMBase):
    corner_tips: list[CornerCoachingTipRead]
    consistency: ConsistencyScoreRead
    tyre_preservation: list[TyrePreservationTipRead]
