from __future__ import annotations

import uuid

from database.models.enums import TyreCompound
from database.models.lap import Lap
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint

# Same single-corner speed trace used in test_coaching_service.py - see
# that file for why these particular values reliably yield one corner.
_STRAIGHT = [250.0] * 6
_BRAKE_ZONE = [250.0, 220.0, 190.0, 160.0, 130.0, 110.0, 95.0]
_EXIT_ZONE = [95.0, 110.0, 130.0, 160.0, 190.0, 220.0, 250.0]
_CORNER_STEERING = [0.0] * 6 + [0.4] * 15 + [0.0] * 6


def _corner_speeds(apex_kph: float) -> list[float]:
    return _STRAIGHT + _BRAKE_ZONE + [apex_kph] + _EXIT_ZONE + _STRAIGHT


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


async def _register(client, email: str) -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "supersecret1", "display_name": "API Test"},
    )
    assert resp.status_code == 201
    return resp.json()


def _auth_headers(tokens: dict) -> dict:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


async def _create_session(client, tokens: dict) -> uuid.UUID:
    resp = await client.post(
        "/api/v1/sessions",
        json={"game": "f1_25", "track_name": "Monza", "session_type": "race"},
        headers=_auth_headers(tokens),
    )
    assert resp.status_code == 201
    return uuid.UUID(resp.json()["id"])


# --- Happy path ---


async def test_get_coaching_report_happy_path(client, db_session):
    tokens = await _register(client, "coach-happy@example.com")
    session_id = await _create_session(client, tokens)

    lap1 = Lap(
        session_id=session_id, lap_number=1, lap_time_ms=90_000, is_valid=True, tyre_compound=TyreCompound.SOFT
    )
    lap2 = Lap(
        session_id=session_id, lap_number=2, lap_time_ms=91_000, is_valid=True, tyre_compound=TyreCompound.SOFT
    )
    db_session.add_all([lap1, lap2])
    await db_session.flush()
    db_session.add_all(_frames_for_lap(session_id, lap1.id, _corner_speeds(95.0)))
    db_session.add_all(_frames_for_lap(session_id, lap2.id, _corner_speeds(90.0)))
    db_session.add(
        TyreStint(
            session_id=session_id,
            compound=TyreCompound.SOFT,
            age_laps=2,
            wear_fl_pct=20.0,
            wear_fr_pct=21.0,
            wear_rl_pct=19.0,
            wear_rr_pct=19.5,
        )
    )
    await db_session.flush()

    resp = await client.get(f"/api/v1/coaching/{session_id}/report", headers=_auth_headers(tokens))
    assert resp.status_code == 200
    body = resp.json()
    assert body["consistency"]["lap_count"] == 2
    assert len(body["corner_tips"]) == 1
    assert body["corner_tips"][0]["corner"]["min_speed_kph"] == 90.0
    assert body["corner_tips"][0]["potential_gain_kph"] == 5.0
    assert len(body["tyre_preservation"]) >= 1


# --- Failure cases ---


async def test_get_coaching_report_404_for_nonexistent_session(client):
    tokens = await _register(client, "coach-404@example.com")
    resp = await client.get(f"/api/v1/coaching/{uuid.uuid4()}/report", headers=_auth_headers(tokens))
    assert resp.status_code == 404


async def test_get_coaching_report_403_for_other_users_session(client):
    owner_tokens = await _register(client, "coach-owner@example.com")
    session_id = await _create_session(client, owner_tokens)

    other_tokens = await _register(client, "coach-other@example.com")
    resp = await client.get(f"/api/v1/coaching/{session_id}/report", headers=_auth_headers(other_tokens))
    assert resp.status_code == 403


async def test_get_coaching_report_401_without_auth(client):
    resp = await client.get(f"/api/v1/coaching/{uuid.uuid4()}/report")
    assert resp.status_code == 401


async def test_get_coaching_report_422_for_malformed_session_id(client):
    tokens = await _register(client, "coach-422@example.com")
    resp = await client.get("/api/v1/coaching/not-a-uuid/report", headers=_auth_headers(tokens))
    assert resp.status_code == 422


async def test_get_coaching_report_409_for_no_completed_laps(client):
    tokens = await _register(client, "coach-nolaps@example.com")
    session_id = await _create_session(client, tokens)

    resp = await client.get(f"/api/v1/coaching/{session_id}/report", headers=_auth_headers(tokens))
    assert resp.status_code == 409


async def test_get_coaching_report_409_for_no_telemetry(client, db_session):
    tokens = await _register(client, "coach-notelemetry@example.com")
    session_id = await _create_session(client, tokens)
    db_session.add(Lap(session_id=session_id, lap_number=1, lap_time_ms=90_000, is_valid=True))
    await db_session.flush()

    resp = await client.get(f"/api/v1/coaching/{session_id}/report", headers=_auth_headers(tokens))
    assert resp.status_code == 409
