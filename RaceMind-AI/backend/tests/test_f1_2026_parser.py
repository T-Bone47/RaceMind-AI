from __future__ import annotations

import struct

from telemetry.models import GameTitle, TelemetryFrame
from telemetry.packet_router import PacketRouter
from telemetry.parsers import register_all
from telemetry.parsers.f1_2026 import (
    _CAR_TELEMETRY_FORMAT,
    _CAR_TELEMETRY_SIZE,
    _HEADER_FORMAT,
    _HEADER_SIZE,
    _MAX_CARS,
    _PACKET_ID_CAR_TELEMETRY,
    F1_2026Parser,
    decode_header,
)


def _build_header(packet_id: int, player_car_index: int = 0) -> bytes:
    return struct.pack(
        _HEADER_FORMAT,
        2026,  # packetFormat
        26,  # gameYear
        1,  # gameMajorVersion
        0,  # gameMinorVersion
        1,  # packetVersion
        packet_id,
        987654321,  # sessionUID
        30.0,  # sessionTime
        1800,  # frameIdentifier
        1800,  # overallFrameIdentifier
        player_car_index,
        255,
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
        0,  # engineTemperature - now uint8, was uint16 in F1 24/25
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
            cars += _build_car_telemetry()
    trailer = struct.pack("<BBb", 255, 255, 0)
    return header + cars + trailer


def test_struct_sizes_match_f1_26s_documented_packet_sizes():
    """The load-bearing check, same as F1 24's equivalent test: these
    format strings must compute to exactly what F1 26's own spec states,
    including the 22->24 car count change and the engineTemperature
    uint16->uint8 change."""
    assert _HEADER_SIZE == 29
    assert _MAX_CARS == 24
    assert _CAR_TELEMETRY_SIZE == 59  # 60 in F1 24/25, one byte less here
    assert _HEADER_SIZE + _MAX_CARS * _CAR_TELEMETRY_SIZE + 3 == 1448


def test_decode_header_reports_2026_format():
    raw = _build_header(packet_id=6, player_car_index=2)
    header = decode_header(raw)

    assert header.packet_format == 2026
    assert header.game_year == 26
    assert header.player_car_index == 2


def test_decode_car_telemetry_packet_extracts_player_car_correctly():
    packet = _build_car_telemetry_packet(
        player_car_index=7,
        target_car_data=dict(
            speed=310, throttle=1.0, steer=0.0, brake=0.0, gear=8, engine_rpm=12400, drs=1
        ),
    )
    parser = F1_2026Parser()
    frame = parser.decode_packet(packet)

    assert isinstance(frame, TelemetryFrame)
    assert frame.speed_kph == 310.0
    assert round(frame.throttle_pct, 1) == 100.0
    assert frame.gear == 8
    assert frame.engine_rpm == 12400.0
    assert frame.drs_active is True


def test_decode_car_telemetry_reads_car_23_not_car_0():
    """Same off-by-one regression guard as the F1 24 suite, but here it
    specifically exercises the NEW car slots (22, 23) that only exist
    because F1 26 raised the car cap to 24 - a naive port of the F1 24
    parser with _MAX_CARS left at 22 would silently truncate these."""
    packet = _build_car_telemetry_packet(
        player_car_index=23, target_car_data=dict(speed=280, gear=6)
    )
    parser = F1_2026Parser()
    frame = parser.decode_packet(packet)

    assert frame is not None
    assert frame.speed_kph == 280.0
    assert frame.gear == 6


def test_router_dispatches_f1_26_to_the_real_parser():
    router = PacketRouter()
    register_all(router)

    packet = _build_car_telemetry_packet(player_car_index=0, target_car_data=dict(speed=200, gear=5))
    result = router.route(GameTitle.F1_26, packet)

    assert isinstance(result, TelemetryFrame)
    assert result.speed_kph == 200.0
