from __future__ import annotations

import uuid

from auth.security import hash_password
from database.models.enums import SessionType
from database.models.lap import Lap
from database.models.session import RaceSession
from database.models.telemetry import TelemetryFrameRecord
from database.models.user import User
from database.repositories.lap_repository import LapRepository
from database.repositories.recording_repository import TelemetryFrameRepository, TyreStintRepository
from database.repositories.session_repository import SessionRepository
from services.coaching_service import CoachingService
from telemetry.models import GameTitle
from tests.engineer_state_fixtures import build_state
from voice.intents.handlers import coaching
from voice.intents.models import HandlerContext, IntentType, ParsedIntent

# Same single-corner speed trace used in test_coaching_service.py - see
# that file for why these particular values reliably yield one corner.
_STRAIGHT = [250.0] * 6
_BRAKE_ZONE = [250.0, 220.0, 190.0, 160.0, 130.0, 110.0, 95.0]
_EXIT_ZONE = [95.0, 110.0, 130.0, 160.0, 190.0, 220.0, 250.0]
_CORNER_STEERING = [0.0] * 6 + [0.4] * 15 + [0.0] * 6


def _corner_speeds(apex_kph: float) -> list[float]:
    return _STRAIGHT + _BRAKE_ZONE + [apex_kph] + _EXIT_ZONE + _STRAIGHT


def _frames_for_lap(session_id, lap_id, speeds, *, start_ts_ms=0, step_ms=200):
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


async def _make_session(db_session) -> RaceSession:
    user = User(
        email=f"{uuid.uuid4()}@example.com", hashed_password=hash_password("password123"), display_name="Coach Test"
    )
    db_session.add(user)
    await db_session.flush()
    session = RaceSession(user_id=user.id, game=GameTitle.F1_25, track_name="Monza", session_type=SessionType.RACE)
    db_session.add(session)
    await db_session.flush()
    return session


def _service(db_session) -> CoachingService:
    return CoachingService(
        LapRepository(db_session),
        TelemetryFrameRepository(db_session),
        TyreStintRepository(db_session),
        SessionRepository(db_session),
    )


def _ctx(session_id, coaching_service) -> HandlerContext:
    return HandlerContext(session_id=session_id, state=build_state(), coaching_service=coaching_service)


def _parsed(text: str) -> ParsedIntent:
    return ParsedIntent(intent_type=IntentType.COACHING, raw_text=text)


async def test_coaching_handler_without_a_configured_service_reports_no_session_data(db_session):
    ctx = _ctx(uuid.uuid4(), coaching_service=None)
    response = await coaching.handle(_parsed("How was Turn 4?"), ctx)
    assert response.text == "I don't have enough session data."


async def test_coaching_handler_without_a_turn_number_cannot_confirm(db_session):
    ctx = _ctx(uuid.uuid4(), coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was that corner?"), ctx)
    assert response.text == "Unable to confirm."


async def test_coaching_handler_reports_no_telemetry_for_a_nonexistent_session(db_session):
    ctx = _ctx(uuid.uuid4(), coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was Turn 1?"), ctx)
    assert response.text == "No telemetry available."


async def test_coaching_handler_reports_no_telemetry_when_session_has_no_completed_laps(db_session):
    session = await _make_session(db_session)
    ctx = _ctx(session.id, coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was Turn 1?"), ctx)
    assert response.text == "No telemetry available."


async def test_coaching_handler_cannot_confirm_when_the_asked_corner_was_not_detected(db_session):
    session = await _make_session(db_session)
    lap = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True)
    db_session.add(lap)
    await db_session.flush()
    db_session.add_all(_frames_for_lap(session.id, lap.id, _corner_speeds(90.0)))
    await db_session.flush()

    # Only corner index 1 exists in this session - asking about turn 9
    # should not be able to confirm rather than guessing.
    ctx = _ctx(session.id, coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was Turn 9?"), ctx)
    assert response.text == "Unable to confirm."


async def test_coaching_handler_falls_back_to_mid_phase_feedback_with_a_single_lap(db_session):
    # A single lap has no previous lap to compare against, so
    # potential_gain_kph is None - the handler should speak the
    # mid-corner feedback message instead.
    session = await _make_session(db_session)
    lap = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True)
    db_session.add(lap)
    await db_session.flush()
    db_session.add_all(_frames_for_lap(session.id, lap.id, _corner_speeds(90.0)))
    await db_session.flush()

    ctx = _ctx(session.id, coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was Turn 1?"), ctx)

    assert "Turn 1" not in response.text  # the gain-report phrasing wasn't used
    assert response.text != ""
    assert response.text not in ("Unable to confirm.", "No telemetry available.")


async def test_coaching_handler_reports_potential_gain_with_two_laps(db_session):
    session = await _make_session(db_session)
    lap1 = Lap(session_id=session.id, lap_number=1, lap_time_ms=90_000, is_valid=True)
    lap2 = Lap(session_id=session.id, lap_number=2, lap_time_ms=91_000, is_valid=True)
    db_session.add_all([lap1, lap2])
    await db_session.flush()
    # lap1 carries the corner faster (apex 95) than lap2 (apex 90), so
    # the latest lap (lap2, the one analyzed) shows a positive gain.
    db_session.add_all(_frames_for_lap(session.id, lap1.id, _corner_speeds(95.0)))
    db_session.add_all(_frames_for_lap(session.id, lap2.id, _corner_speeds(90.0)))
    await db_session.flush()

    ctx = _ctx(session.id, coaching_service=_service(db_session))
    response = await coaching.handle(_parsed("How was Turn 1?"), ctx)

    assert response.text == "Turn 1: 5.0 kph available."


async def test_coaching_handler_never_enqueues_onto_the_radio_queue(db_session):
    ctx = _ctx(uuid.uuid4(), coaching_service=None)
    response = await coaching.handle(_parsed("How was Turn 4?"), ctx)
    assert response.to_enqueue == []
