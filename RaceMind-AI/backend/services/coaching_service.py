"""Driver Coach service: loads a session's persisted laps, telemetry
frames, and tyre stints, converts them into the plain domain types
`coaching/` expects, and runs the existing `coaching.DriverCoach`
pipeline over them. `coaching/` itself stays untouched and DB-agnostic,
matching the pattern already established for `strategy/` in
`services/strategy_service.py`.
"""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from coaching.coach import DriverCoach
from coaching.models import CoachingReport, TelemetrySample
from coaching.tyre_preservation import TyreWearSnapshot
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint
from database.repositories.lap_repository import LapRepository
from database.repositories.recording_repository import TelemetryFrameRepository, TyreStintRepository
from database.repositories.session_repository import SessionRepository

_KPH_TO_MPS = 1.0 / 3.6


class CoachingService:
    def __init__(
        self,
        lap_repo: LapRepository,
        telemetry_repo: TelemetryFrameRepository,
        tyre_repo: TyreStintRepository,
        session_repo: SessionRepository,
    ) -> None:
        self.lap_repo = lap_repo
        self.telemetry_repo = telemetry_repo
        self.tyre_repo = tyre_repo
        self.session_repo = session_repo
        self.coach = DriverCoach()

    async def generate_report(self, session_id: uuid.UUID) -> CoachingReport:
        session = await self.session_repo.get(session_id)
        if session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

        laps = await self.lap_repo.list_for_session(session_id)
        completed_laps = [lap for lap in laps if lap.lap_time_ms is not None]
        if not completed_laps:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No completed laps recorded for this session yet",
            )

        lap_samples: list[list[TelemetrySample]] = []
        lap_times_ms: list[int] = []
        for lap in completed_laps:
            frames = await self.telemetry_repo.list_for_lap(lap.id)
            if not frames:
                continue
            lap_time_ms = lap.lap_time_ms
            if lap_time_ms is None:
                continue  # unreachable given the completed_laps filter above; keeps mypy honest
            lap_samples.append(_frames_to_samples(frames))
            lap_times_ms.append(lap_time_ms)

        if not lap_samples:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No telemetry recorded for any completed lap in this session",
            )

        stints = await self.tyre_repo.list_for_session(session_id)
        wear_snapshots = [_stint_to_snapshot(stint) for stint in stints]

        return self.coach.generate_report(
            laps=lap_samples,
            lap_times_ms=lap_times_ms,
            tyre_wear_snapshots=wear_snapshots,
        )


def _frames_to_samples(frames: list[TelemetryFrameRecord]) -> list[TelemetrySample]:
    """Converts one lap's persisted telemetry frames into
    `coaching.TelemetrySample`, in the same order as `frames`.

    Requires `frames` already ordered by `timestamp_ms` ascending, as
    `TelemetryFrameRepository.list_for_lap` returns them - this
    matches the rest of the coaching/ pipeline, which trusts sample
    order rather than re-sorting defensively (see corner_detection.py).

    `TelemetryFrameRecord` has no persisted `lap_distance_m` column
    (see Step 4's data constraint), so it is ESTIMATED here, not
    measured: distance starts at 0.0 for the first frame of the lap,
    and each subsequent frame adds the trapezoidal area under the
    speed-vs-time curve since the previous frame -
    avg(speed_prev, speed_curr) * dt. This is exact for a linearly
    changing speed between samples and a close approximation
    otherwise; it needs no extra dependency and is fully deterministic
    for a given frame set. A non-positive dt (duplicate or
    out-of-order timestamps) contributes zero distance for that step
    rather than a negative one.
    """
    samples: list[TelemetrySample] = []
    distance_m = 0.0
    previous: TelemetryFrameRecord | None = None
    for frame in frames:
        if previous is not None:
            dt_seconds = (frame.timestamp_ms - previous.timestamp_ms) / 1000.0
            if dt_seconds > 0:
                avg_speed_mps = ((previous.speed_kph + frame.speed_kph) / 2) * _KPH_TO_MPS
                distance_m += avg_speed_mps * dt_seconds
        samples.append(
            TelemetrySample(
                lap_distance_m=distance_m,
                speed_kph=frame.speed_kph,
                throttle_pct=frame.throttle_pct,
                brake_pct=frame.brake_pct,
                steering=frame.steering,
            )
        )
        previous = frame
    return samples


def _stint_to_snapshot(stint: TyreStint) -> TyreWearSnapshot:
    return TyreWearSnapshot(
        age_laps=stint.age_laps,
        wear_fl_pct=stint.wear_fl_pct,
        wear_fr_pct=stint.wear_fr_pct,
        wear_rl_pct=stint.wear_rl_pct,
        wear_rr_pct=stint.wear_rr_pct,
    )
