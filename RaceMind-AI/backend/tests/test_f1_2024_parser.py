from __future__ import annotations

import struct

from telemetry.models import GameTitle, TelemetryFrame
from telemetry.packet_router import PacketRouter
from telemetry.parsers import register_all
from telemetry.parsers.f1_2024 import (
    _CAR_TELEMETRY_FORMAT,
    _CAR_TELEMETRY_SIZE,
    _HEADER_FORMAT,
    _HEADER_SIZE,
    _MAX_CARS,
    _PACKET_ID_CAR_TELEMETRY,
    F1_2024Parser,
    decode_header,
)


def _build_header(packet_id: int, player_car_index: int = 0) -> bytes:
    return struct.pack(
        _HEADER_FORMAT,
        2024,  # packetFormat
        24,  # gameYear
        1,  # gameMajorVersion
        0,  # gameMinorVersion
        1,  # packetVersion
        packet_id,
        123456789,  # sessionUID
        12.5,  # sessionTime
        900,  # frameIdentifier
        900,  # overallFrameIdentifier
        player_car_index,
        255,  # secondaryPlayerCarIndex (255 = none)
    )


def _build_car_telemetry(
    speed: int = 0,
    throttle: float = 0.0,
    steer: float = 0.0,
    brake: float = 0.0,
    gear: int = 0,
    engine_rpm: int = 0,
    drs: int = 0,
) -> bytes:
    return struct.pack(
        _CAR_TELEMETRY_FORMAT,
        speed,
        throttle,
        steer,
        brake,
        50,  # clutch
        gear,
        engine_rpm,
        drs,
        0,  # revLightsPercent
        0,  # revLightsBitValue
        0, 0, 0, 0,  # brakesTemperature[4]
        0, 0, 0, 0,  # tyresSurfaceTemperature[4]
        0, 0, 0, 0,  # tyresInnerTemperature[4]
        0,  # engineTemperature
        0.0, 0.0, 0.0, 0.0,  # tyresPressure[4]
        0, 0, 0, 0,  # surfaceType[4]
    )


def _build_car_telemetry_packet(player_car_index: int, target_car_data: dict) -> bytes:
    header = _build_header(_PACKET_ID_CAR_TELEMETRY, player_car_index)
    cars = b""
    for i in range(_MAX_CARS):
        if i == player_car_index:
            cars += _build_car_telemetry(**target_car_data)
        else:
            cars += _build_car_telemetry()  # zeroed filler car
    trailer = struct.pack("<BBb", 255, 255, 0)  # mfdPanelIndex x2, suggestedGear
    return header + cars + trailer


def test_struct_sizes_match_documented_packet_sizes():
    """The load-bearing check: our struct formats must compute to exactly
    the byte sizes the official spec states, or every offset downstream
    is wrong."""
    assert _HEADER_SIZE == 29
    assert _CAR_TELEMETRY_SIZE == 60
    # header + 22 cars + 3 trailing bytes (mfdPanelIndex x2 + suggestedGear) = 1352
    assert _HEADER_SIZE + _MAX_CARS * _CAR_TELEMETRY_SIZE + 3 == 1352


def test_decode_header_extracts_correct_fields():
    raw = _build_header(packet_id=6, player_car_index=3)
    header = decode_header(raw)

    assert header.packet_id == 6
    assert header.packet_format == 2024
    assert header.game_year == 24
    assert header.session_uid == 123456789
    assert header.session_time == 12.5
    assert header.player_car_index == 3


def test_decode_car_telemetry_packet_extracts_player_car_correctly():
    packet = _build_car_telemetry_packet(
        player_car_index=5,
        target_car_data=dict(
            speed=287, throttle=0.92, steer=-0.15, brake=0.0, gear=7, engine_rpm=11800, drs=1
        ),
    )
    parser = F1_2024Parser()
    frame = parser.decode_packet(packet)

    assert isinstance(frame, TelemetryFrame)
    assert frame.speed_kph == 287.0
    assert round(frame.throttle_pct, 1) == 92.0
    assert round(frame.steering, 2) == -0.15
    assert frame.brake_pct == 0.0
    assert frame.gear == 7
    assert frame.engine_rpm == 11800.0
    assert frame.drs_active is True


def test_decode_car_telemetry_reads_the_correct_car_index_not_car_zero():
    """Regression guard for an easy off-by-one: if the offset math is
    wrong, this would silently return car 0's (zeroed) data instead of
    car 5's real data - both are valid TelemetryFrames, so only checking
    the actual values (not just "did it return something") catches it."""
    packet = _build_car_telemetry_packet(
        player_car_index=5, target_car_data=dict(speed=300, gear=8)
    )
    parser = F1_2024Parser()
    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 300.0
    assert frame.gear == 8


def test_non_car_telemetry_packet_returns_none_not_garbage():
    session_packet = _build_header(packet_id=1) + b"\x00" * 700  # id 1 = Session, not implemented
    parser = F1_2024Parser()
    assert parser.decode_packet(session_packet) is None


def test_truncated_packet_returns_none_rather_than_raising():
    truncated = _build_header(packet_id=_PACKET_ID_CAR_TELEMETRY) + b"\x00" * 10
    parser = F1_2024Parser()
    assert parser.decode_packet(truncated) is None


def test_router_dispatches_f1_24_to_real_parser_and_others_to_stubs():
    router = PacketRouter()
    register_all(router)

    packet = _build_car_telemetry_packet(player_car_index=0, target_car_data=dict(speed=150, gear=4))
    result = router.route(GameTitle.F1_24, packet)
    assert isinstance(result, TelemetryFrame)
    assert result.speed_kph == 150.0

    # F1 15's stub raises NotImplementedError internally - the router
    # must swallow that and return None, not propagate the exception.
    stub_result = router.route(GameTitle.F1_15, packet)
    assert stub_result is None


def test_f1_25_reuses_f1_24_logic_correctly():
    """F1_2025Parser subclasses F1_2024Parser (verified byte-identical
    format - see f1_2025.py's docstring). This uses F1 24's own
    packet-building helpers, which is the correct shape for F1 25 too -
    unlike F1 26, which has a genuinely different struct and needs its
    own builders (see test_f1_2026_parser.py)."""
    router = PacketRouter()
    register_all(router)

    packet = _build_car_telemetry_packet(player_car_index=0, target_car_data=dict(speed=175, gear=4))
    result = router.route(GameTitle.F1_25, packet)

    assert isinstance(result, TelemetryFrame)
    assert result.speed_kph == 175.0
