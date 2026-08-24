"""Builds spec-shaped synthetic F1 UDP packets for tests and for
send_udp.py's manual/dev testing against a running backend.

These are the ONLY place packet byte layouts should be duplicated for
test purposes - if a parser's layout ever changes, update it here once
rather than in every test that builds a packet.

The two supported formats (2025, 2026) share an identical 29-byte
header and an identical LapData body; they differ only in
CarTelemetry's per-car stride (60 bytes vs 59 - see
telemetry/parsers/f1_2025_2026_dlc.py for why) which is why the field
layout actually read (bytes 0-18 of each car's block) is the same
either way.
"""

from __future__ import annotations

import struct

HEADER_FORMAT = "<HBBBBBQfIIBB"
HEADER_SIZE = struct.calcsize(HEADER_FORMAT)  # 29

CAR_TELEMETRY_READ_FORMAT = "<HfffBbHB"  # speed, throttle, steer, brake, clutch, gear, engine_rpm, drs
CAR_TELEMETRY_READ_SIZE = struct.calcsize(CAR_TELEMETRY_READ_FORMAT)  # 19

CAR_TELEMETRY_STRIDE = {2025: 60, 2026: 59}
LAP_DATA_STRIDE = 57

LAP_DATA_PACKET_ID = 2
CAR_TELEMETRY_PACKET_ID = 6


def build_header(
    *,
    packet_format: int,
    packet_id: int,
    session_uid: int = 1,
    session_time: float = 0.0,
    frame_id: int = 0,
    player_car_index: int = 0,
    secondary_player_car_index: int = 255,
) -> bytes:
    """The 29-byte header shared by every F1 23+ packet, regardless of
    packet_id. `packet_format` is the field RaceMind's auto-detection
    keys off of (see telemetry/packet_router.py:detect_game)."""
    game_year = packet_format % 100
    return struct.pack(
        HEADER_FORMAT,
        packet_format,
        game_year,
        1,  # game_major_version
        0,  # game_minor_version
        1,  # packet_version
        packet_id,
        session_uid,
        session_time,
        frame_id,
        frame_id,  # overall_frame_id
        player_car_index,
        secondary_player_car_index,
    )


def build_car_telemetry_packet(
    *,
    packet_format: int,
    player_car_index: int = 0,
    speed: int = 0,
    throttle: float = 0.0,
    steer: float = 0.0,
    brake: float = 0.0,
    clutch: int = 0,
    gear: int = 0,
    engine_rpm: int = 0,
    drs: int = 0,
    session_uid: int = 1,
) -> bytes:
    """A CarTelemetry (packet_id=6) datagram with only
    `player_car_index`'s slot populated - earlier car slots are
    zero-filled, and nothing is sent past the target car, since the
    real parsers only ever enforce a lower bound on packet length. This
    intentionally exercises non-zero player_car_index offsets, since
    that's exactly where a wrong per-car stride would misalign data
    without necessarily raising or shrinking the packet below the
    length check.
    """
    stride = CAR_TELEMETRY_STRIDE[packet_format]
    header = build_header(
        packet_format=packet_format,
        packet_id=CAR_TELEMETRY_PACKET_ID,
        session_uid=session_uid,
        player_car_index=player_car_index,
    )
    body = bytearray(stride * (player_car_index + 1))
    car_offset = stride * player_car_index
    body[car_offset : car_offset + CAR_TELEMETRY_READ_SIZE] = struct.pack(
        CAR_TELEMETRY_READ_FORMAT, speed, throttle, steer, brake, clutch, gear, engine_rpm, drs
    )
    return header + bytes(body)


def build_lap_data_packet(
    *,
    packet_format: int,
    player_car_index: int = 0,
    lap_number: int = 1,
    lap_distance_m: float = 0.0,
    session_uid: int = 1,
) -> bytes:
    """A LapData (packet_id=2) datagram with only `player_car_index`'s
    slot populated. Both parsers cache lap_number/lap_distance_m from
    this and attach it to the *next* CarTelemetry frame for the same
    session_uid - decode_packet() itself returns None for LapData, so
    tests verify it via that enrichment, not a direct return value."""
    header = build_header(
        packet_format=packet_format,
        packet_id=LAP_DATA_PACKET_ID,
        session_uid=session_uid,
        player_car_index=player_car_index,
    )
    body = bytearray(LAP_DATA_STRIDE * (player_car_index + 1))
    car_offset = LAP_DATA_STRIDE * player_car_index
    struct.pack_into("<f", body, car_offset + 20, lap_distance_m)
    struct.pack_into("<B", body, car_offset + 33, lap_number)
    return header + bytes(body)
