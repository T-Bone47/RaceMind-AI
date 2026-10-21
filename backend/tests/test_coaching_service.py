from __future__ import annotations

import uuid

import pytest
from pydantic import ValidationError

from api.schemas.coaching import CoachingReportRead, ConfidenceRead
from auth.security import hash_password
from coaching.models import CoachingReport, ConsistencyScore, TyrePreservationTip
from common.confidence import fixed
from database.models.enums import SessionType, TyreCompound
from database.models.lap import Lap
from database.models.session import RaceSession
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint
from database.models.user import User
from database.repositories.lap_repository import LapRepository
from database.repositories.recording_repository import TelemetryFrameRepository, TyreStintRepository
from database.repositories.session_repository import SessionRepository
from services.coaching_service import CoachingService, _frames_to_samples
from telemetry.models import GameTitle

# A single-corner speed trace (kph): flat -> brake to an apex -> accelerate
# back out -> flat. Drop from 250 to 90 (160kph) clears corner_detection's
# 15kph threshold; steering=0.4 through the whole zone clears its 0.12
# minimum, so this reliably yields exactly one detected corner.
_STRAIGHT = [250.0] * 6
_BRAKE_ZONE = [250.0, 220.0, 190.0, 160.0, 130.0, 110.0, 95.0]
_EXIT_ZONE = [95.0, 110.0, 130.0, 160.0, 190.0, 220.0, 250.0]


def _corner_speeds(apex_kph: float) -> list[float]:
    return _STRAIGHT + _BRAKE_ZONE + [apex_kph] + _EXIT_ZONE + _STRAIGHT


_CORNER_STEERING = [0.0] * 6 + [0.4] * 15 + [0.0] * 6


def _frames_for_lap(
    session_id: uuid.UUID, lap_id: uuid.UUID, speeds: list[float], *, start_ts_ms: int = 0, step_ms: int = 200
) -> list[TelemetryFrameRecord]:
    return [
        TelemetryFrameRecord(
            session_id=session_id,
            lap_id=lap_id,
            timestamp_ms=start_ts_ms + i * step_ms,
            speed_kph=speed,
            throttle_pct=50.0,
            brake_pct=0.0,
            steering=steer,
            gear=4,
            engine_rpm=9000.0,
            drs_active=False,
        )
        for i, (speed, steer) in enumerate(zip(speeds, _CORNER_STEERING, strict=True))
    ]


async def _make_user_and_session(db_session) -> tuple[User, RaceSession]:
    user = User(
        email=f"{uuid.uuid4()}@example.com", hashed_password=hash_password("password123"), display_name="Coach Test"
    )
    db_session.add(user)
    await db_session.flush()
    session = RaceSession(user_id=user.id, game=GameTitle.F1_25, track_name="Monza", session_type=SessionType.RACE)
    db_session.add(session)
    await db_session.flush()
    return user, session


def _service(db_session) -> CoachingService:
    return CoachingService(
        LapRepository(db_session),
        TelemetryFrameRepository(db_session),
        TyreStintRepository(db_session),
        SessionRepository(db_session),
    )


# --- Service: failure cases ---


async def test_generate_report_raises_404_for_missing_session(db_session):
    service = _service(db_session)
    with pytest.raises(Exception) as exc_info:
        await service.generate_report(uuid.uuid4())
    assert exc_info.value.status_code == 404


async def test_generate_report_raises_409_for_session_with_no_completed_laps(db_session):
    _, session = await _make_user_and_session(db_session)
    # An in-progress lap with no lap_time_ms yet - shouldn't count as completed.
    db_session.add(Lap(session_id=session.id, lap_number=1, is_valid=True))
    await db_session.flush()

    service = _service(db_session)
    with pytest.raises(Exception) as exc_info:
        await service.generate_report(session.id)
    assert exc_info.value.status_code == 409
    assert "completed lap" in exc_info.value.detail.lower()


async def test_generate_report_raises_409_when_no_telemetry_recorded(db_session):
    _, session = await _make_user_and_session(db_session)
    db_session.add(Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True))
    await db_session.flush()
    # Completed lap exists, but no TelemetryFrameRecord rows were ever recorded for it.

    service = _service(db_session)
    with pytest.raises(Exception) as exc_info:
        await service.generate_report(session.id)
    assert exc_info.value.status_code == 409
    assert "telemetry" in exc_info.value.detail.lower()


# --- Service: happy path ---


async def test_generate_report_happy_path(db_session):
    _, session = await _make_user_and_session(db_session)

    lap1 = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True, tyre_compound=TyreCompound.SOFT)
    lap2 = Lap(session_id=session.id, lap_number=2, lap_time_ms=91_000, is_valid=True, tyre_compound=TyreCompound.SOFT)
    db_session.add_all([lap1, lap2])
    await db_session.flush()

    # lap1 carries the corner a little faster (apex 95kph) than lap2 (apex
    # 90kph) so the latest lap (lap2, analyzed by DriverCoach) should show a
    # positive potential_gain_kph relative to lap1's better minimum speed.
    db_session.add_all(_frames_for_lap(session.id, lap1.id, _corner_speeds(95.0)))
    db_session.add_all(_frames_for_lap(session.id, lap2.id, _corner_speeds(90.0)))

    db_session.add(
        TyreStint(
            session_id=session.id, compound=TyreCompound.SOFT, age_laps=2,
            wear_fl_pct=20.0, wear_fr_pct=21.0, wear_rl_pct=19.0, wear_rr_pct=19.5,
        )
    )
    await db_session.flush()

    service = _service(db_session)
    report = await service.generate_report(session.id)

    assert report.consistency.lap_count == 2
    assert len(report.corner_tips) == 1
    tip = report.corner_tips[0]
    assert tip.corner.min_speed_kph == pytest.approx(90.0)
    assert tip.potential_gain_kph == pytest.approx(5.0, abs=0.1)
    assert len(report.tyre_preservation) >= 1


async def test_generate_report_skips_completed_laps_with_no_telemetry(db_session):
    """A session can have some completed laps with recorded telemetry and
    some without (e.g. the recorder dropped out) - the report should use
    whichever laps have data rather than failing outright."""
    _, session = await _make_user_and_session(db_session)

    lap1 = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True)
    lap2 = Lap(session_id=session.id, lap_number=2, lap_time_ms=91_000, is_valid=True)
    db_session.add_all([lap1, lap2])
    await db_session.flush()

    # Only lap1 gets telemetry; lap2 has none.
    db_session.add_all(_frames_for_lap(session.id, lap1.id, _corner_speeds(90.0)))
    await db_session.flush()

    service = _service(db_session)
    report = await service.generate_report(session.id)

    assert report.consistency.lap_count == 1


async def test_generate_report_works_without_any_tyre_data(db_session):
    _, session = await _make_user_and_session(db_session)
    lap1 = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True)
    db_session.add(lap1)
    await db_session.flush()
    db_session.add_all(_frames_for_lap(session.id, lap1.id, _corner_speeds(90.0)))
    await db_session.flush()

    service = _service(db_session)
    report = await service.generate_report(session.id)

    assert report.tyre_preservation == []


# --- lap_distance_m estimation (the Step 4 data constraint) ---


def test_frames_to_samples_constant_speed_integrates_linearly():
    session_id, lap_id = uuid.uuid4(), uuid.uuid4()
    frames = [
        TelemetryFrameRecord(
            session_id=session_id, lap_id=lap_id, timestamp_ms=ts, speed_kph=36.0,  # 36kph = 10 m/s
            throttle_pct=50.0, brake_pct=0.0, steering=0.0, gear=4, engine_rpm=9000.0, drs_active=False,
        )
        for ts in (0, 1000, 2000)
    ]
    samples = _frames_to_samples(frames)
    assert [s.lap_distance_m for s in samples] == pytest.approx([0.0, 10.0, 20.0])


def test_frames_to_samples_accelerating_speed_uses_trapezoidal_average():
    session_id, lap_id = uuid.uuid4(), uuid.uuid4()
    speeds_kph = [0.0, 36.0, 72.0]  # 0, 10, 20 m/s - constant acceleration
    frames = [
        TelemetryFrameRecord(
            session_id=session_id, lap_id=lap_id, timestamp_ms=i * 1000, speed_kph=speed,
            throttle_pct=100.0, brake_pct=0.0, steering=0.0, gear=4, engine_rpm=9000.0, drs_active=False,
        )
        for i, speed in enumerate(speeds_kph)
    ]
    samples = _frames_to_samples(frames)
    # Trapezoidal integration is exact for a linear speed ramp: distance
    # under constant acceleration a=10 m/s^2 over 2s is 0.5*a*t^2 = 20m.
    assert [s.lap_distance_m for s in samples] == pytest.approx([0.0, 5.0, 20.0])


def test_frames_to_samples_non_positive_dt_contributes_no_distance():
    session_id, lap_id = uuid.uuid4(), uuid.uuid4()
    frames = [
        TelemetryFrameRecord(
            session_id=session_id, lap_id=lap_id, timestamp_ms=0, speed_kph=10.0,
            throttle_pct=0.0, brake_pct=0.0, steering=0.0, gear=1, engine_rpm=5000.0, drs_active=False,
        ),
        TelemetryFrameRecord(
            session_id=session_id, lap_id=lap_id, timestamp_ms=0, speed_kph=20.0,  # duplicate timestamp
            throttle_pct=0.0, brake_pct=0.0, steering=0.0, gear=1, engine_rpm=5000.0, drs_active=False,
        ),
        TelemetryFrameRecord(
            session_id=session_id, lap_id=lap_id, timestamp_ms=1000, speed_kph=72.0,  # 20 m/s
            throttle_pct=0.0, brake_pct=0.0, steering=0.0, gear=1, engine_rpm=5000.0, drs_active=False,
        ),
    ]
    samples = _frames_to_samples(frames)
    # Step 2: dt=0 -> no distance added. Step 3: dt=1s, avg(20,72)kph=46kph=12.778mps -> 12.778m.
    expected_last_m = ((20.0 + 72.0) / 2) / 3.6
    assert [s.lap_distance_m for s in samples] == pytest.approx([0.0, 0.0, expected_last_m], abs=0.001)


def test_frames_to_samples_empty_list_returns_empty():
    assert _frames_to_samples([]) == []


# --- Schema validation ---


def test_coaching_report_read_validates_from_dataclass():
    conf = fixed(0.8, "test")
    report = CoachingReport(
        corner_tips=[],
        consistency=ConsistencyScore(score_0_100=90.0, lap_time_stdev_ms=50.0, lap_count=3, confidence=conf),
        tyre_preservation=[TyrePreservationTip(message="m", reasoning="r", confidence=conf)],
    )
    parsed = CoachingReportRead.model_validate(report, from_attributes=True)
    assert parsed.consistency.lap_count == 3
    assert parsed.tyre_preservation[0].message == "m"


def test_confidence_read_rejects_missing_required_field():
    with pytest.raises(ValidationError):
        ConfidenceRead.model_validate({"value": 0.8})  # missing "reason"
