"""Tests for the F1 2025 UDP parser."""

from telemetry.parsers.f1_2025 import F12025Parser
from tests.f1_packet_builders import build_car_telemetry_packet, build_header, build_lap_data_packet


def test_f1_2025_car_telemetry_decoded():
    parser = F12025Parser()
    packet = build_car_telemetry_packet(
        packet_format=2025,
        speed=287,
        throttle=1.0,
        steer=-0.25,
        brake=0.0,
        gear=7,
        engine_rpm=11800,
        drs=1,
    )

    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 287
    assert frame.throttle_pct == 100.0
    assert frame.steering == -0.25
    assert frame.brake_pct == 0.0
    assert frame.gear == 7
    assert frame.engine_rpm == 11800
    assert frame.drs_active is True


def test_f1_2025_car_telemetry_nonzero_player_index_decoded():
    """Regression guard: an earlier, wrong per-car stride would only
    misbehave for a non-zero player_car_index, since offset = 29 +
    index * stride collapses to 29 either way when index is 0."""
    parser = F12025Parser()
    packet = build_car_telemetry_packet(
        packet_format=2025,
        player_car_index=5,
        speed=150,
        throttle=0.5,
        gear=3,
        engine_rpm=8000,
    )

    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 150
    assert frame.gear == 3
    assert frame.engine_rpm == 8000


def test_f1_2025_lap_data_enriches_next_car_telemetry():
    """decode_packet() returns None for LapData itself - it's cached
    per session_uid and attached to the next CarTelemetry frame."""
    parser = F12025Parser()
    lap_packet = build_lap_data_packet(
        packet_format=2025, session_uid=42, lap_number=6, lap_distance_m=1234.5
    )
    telemetry_packet = build_car_telemetry_packet(packet_format=2025, session_uid=42, speed=200)

    assert parser.decode_packet(lap_packet) is None

    frame = parser.decode_packet(telemetry_packet)

    assert frame is not None
    assert frame.lap_number == 6
    assert frame.lap_distance_m == 1234.5


def test_f1_2025_unknown_packet_id_ignored_safely():
    parser = F12025Parser()
    # Motion (packet_id=0) isn't handled by this parser - must return
    # None, not raise, so one packet type RaceMind doesn't use can't
    # take down the receive loop.
    packet = build_header(packet_format=2025, packet_id=0) + bytes(200)

    assert parser.decode_packet(packet) is None


def test_f1_2025_truncated_packet_does_not_crash():
    parser = F12025Parser()
    assert parser.decode_packet(b"") is None
    assert parser.decode_packet(b"too short") is None

    # Valid header claiming CarTelemetry, but body cut off before the
    # fields the parser actually reads.
    full_packet = build_car_telemetry_packet(packet_format=2025, speed=300)
    assert parser.decode_packet(full_packet[:35]) is None
