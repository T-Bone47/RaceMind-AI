"""F1 26 UDP telemetry parser - genuinely independent from F1 24/25, not
a version-bumped copy.

F1 26's own changelog states real structural changes, both verified
against this file's struct math and the spec's documented packet sizes:

- Max cars increased 22 -> 24 (new team for the 2026 season), so every
  per-car array size and total packet size changed.
- CarTelemetryData: engineTemperature shrank from uint16 to uint8,
  making each car's telemetry block 59 bytes (was 60 for F1 24/25).
  Header(29) + 24*59 + 3 trailing bytes = 1448, matching the spec's
  stated packet size exactly (see test_f1_2026_parser.py).

Because these are real binary-layout differences - not just a version
number - F1 26 could not reuse F1_2024Parser the way F1_2025Parser does
(see f1_2025.py's docstring for that contrast).
"""

from __future__ import annotations

import struct
from dataclasses import dataclass

from telemetry.models import GameTitle, TelemetryFrame, TelemetryMessage
from telemetry.packet_router import PacketHeader

_HEADER_FORMAT = "<HBBBBBQfIIBB"
_HEADER_SIZE = struct.calcsize(_HEADER_FORMAT)

# Identical field order to F1 24/25 except m_engineTemperature: uint16 -> uint8.
_CAR_TELEMETRY_FORMAT = "<HfffBbHBBH4H4B4BB4f4B"
_CAR_TELEMETRY_SIZE = struct.calcsize(_CAR_TELEMETRY_FORMAT)

_PACKET_ID_CAR_TELEMETRY = 6

_MAX_CARS = 24  # up from 22 in F1 24/25 - the 2026-season new-team change


def decode_header(raw: bytes) -> PacketHeader:
    fields = struct.unpack(_HEADER_FORMAT, raw[:_HEADER_SIZE])
    (
        packet_format,
        game_year,
        _game_major_version,
        _game_minor_version,
        _packet_version,
        packet_id,
        session_uid,
        session_time,
        frame_identifier,
        _overall_frame_identifier,
        player_car_index,
        _secondary_player_car_index,
    ) = fields
    return PacketHeader(
        packet_id=packet_id,
        packet_format=packet_format,
        game_year=game_year,
        session_uid=session_uid,
        session_time=session_time,
        frame_identifier=frame_identifier,
        player_car_index=player_car_index,
    )


@dataclass(frozen=True)
class CarTelemetry:
    speed_kph: int
    throttle: float
    steer: float
    brake: float
    gear: int
    engine_rpm: int
    drs_active: bool


def decode_car_telemetry(raw: bytes, car_index: int) -> CarTelemetry:
    if not (0 <= car_index < _MAX_CARS):
        raise ValueError(f"car_index {car_index} out of range 0-{_MAX_CARS - 1}")
    offset = _HEADER_SIZE + car_index * _CAR_TELEMETRY_SIZE
    chunk = raw[offset : offset + _CAR_TELEMETRY_SIZE]
    speed, throttle, steer, brake, _clutch, gear, engine_rpm, drs, *_rest = struct.unpack(
        _CAR_TELEMETRY_FORMAT, chunk
    )
    return CarTelemetry(
        speed_kph=speed,
        throttle=throttle,
        steer=steer,
        brake=brake,
        gear=gear,
        engine_rpm=engine_rpm,
        drs_active=bool(drs),
    )


class F1_2026Parser:
    """GameYearParser implementation for F1 26 (see packet_router.GameYearParser)."""

    game = GameTitle.F1_26

    def decode_packet(self, raw: bytes) -> TelemetryMessage | None:
        if len(raw) < _HEADER_SIZE:
            return None
        header = decode_header(raw)

        if header.packet_id == _PACKET_ID_CAR_TELEMETRY:
            return self._decode_car_telemetry_packet(raw, header)

        # LapData, CarSetups, and the new Car Telemetry 2 packet (id 16)
        # aren't wired to a TelemetryMessage yet - dropped, not guessed at.
        return None

    @staticmethod
    def _decode_car_telemetry_packet(raw: bytes, header: PacketHeader) -> TelemetryFrame | None:
        expected_min_size = _HEADER_SIZE + _MAX_CARS * _CAR_TELEMETRY_SIZE
        if len(raw) < expected_min_size:
            return None

        car = decode_car_telemetry(raw, header.player_car_index)
        return TelemetryFrame(
            speed_kph=float(car.speed_kph),
            throttle_pct=_clamp(car.throttle * 100, 0.0, 100.0),
            brake_pct=_clamp(car.brake * 100, 0.0, 100.0),
            steering=_clamp(car.steer, -1.0, 1.0),
            gear=car.gear,
            engine_rpm=float(car.engine_rpm),
            drs_active=car.drs_active,
        )


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))
