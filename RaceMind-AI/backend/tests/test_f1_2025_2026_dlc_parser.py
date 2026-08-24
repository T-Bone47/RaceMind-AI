"""Tests for the F1 2025 2026 Season Pack DLC UDP parser."""

import pytest

from telemetry.parsers.f1_2025_2026_dlc import F120252026DLCParser
from tests.f1_packet_builders import build_car_telemetry_packet, build_header, build_lap_data_packet


def test_f1_2026_dlc_car_telemetry_decoded():
    parser = F120252026DLCParser()
    packet = build_car_telemetry_packet(
        packet_format=2026,
        speed=310,
        throttle=1.0,
        steer=0.1,
        brake=0.0,
        gear=8,
        engine_rpm=12100,
        drs=0,
    )

    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 310
    assert frame.throttle_pct == 100.0
    assert frame.gear == 8
    assert frame.engine_rpm == 12100
    assert frame.drs_active is False


def test_f1_2026_dlc_car_telemetry_nonzero_player_index_decoded():
    """Regression guard for the 59-byte (not 60-byte) per-car stride:
    this only surfaces for a non-zero player_car_index, since offset =
    29 + index * stride collapses to 29 either way when index is 0 -
    exactly the case Time Trial testing alone would never catch."""
    parser = F120252026DLCParser()
    packet = build_car_telemetry_packet(
        packet_format=2026,
        player_car_index=3,
        speed=222,
        gear=5,
        engine_rpm=9500,
    )

    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 222
    assert frame.gear == 5
    assert frame.engine_rpm == 9500


def test_f1_2026_dlc_lap_data_enriches_next_car_telemetry():
    parser = F120252026DLCParser()
    lap_packet = build_lap_data_packet(
        packet_format=2026, session_uid=7, lap_number=12, lap_distance_m=987.6
    )
    telemetry_packet = build_car_telemetry_packet(packet_format=2026, session_uid=7, speed=190)

    assert parser.decode_packet(lap_packet) is None

    frame = parser.decode_packet(telemetry_packet)

    assert frame is not None
    assert frame.lap_number == 12
    # lap_distance_m round-trips through a 32-bit float on the wire,
    # so exact equality against the Python float literal isn't valid.
    assert frame.lap_distance_m == pytest.approx(987.6, rel=1e-5)


def test_f1_2026_dlc_car_telemetry2_ignored_safely():
    """packet_id=16 (CarTelemetry2, new in the 2026 DLC) isn't
    translated into the current TelemetryFrame - must return None, not
    raise."""
    parser = F120252026DLCParser()
    packet = build_header(packet_format=2026, packet_id=16) + bytes(200)

    assert parser.decode_packet(packet) is None


def test_f1_2026_dlc_truncated_packet_does_not_crash():
    parser = F120252026DLCParser()
    assert parser.decode_packet(b"") is None
    assert parser.decode_packet(b"too short") is None

    full_packet = build_car_telemetry_packet(packet_format=2026, speed=300)
    assert parser.decode_packet(full_packet[:35]) is None
