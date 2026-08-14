"""F1 24 UDP telemetry parser - real parsing, not a stub.

Implemented against the F1 24 UDP specification EA/Codemasters publish
specifically for third-party developers (linked from the in-game UDP
settings menu; mirrored on the EA Answers forums). Struct layouts below
are verified against that documentation's own stated packet sizes:

- Header: 29 bytes                                          -> confirmed
- CarTelemetryData: 60 bytes/car (22 cars + 3 trailing = 1352 total) -> confirmed
- LapData: 57 bytes/car (22 cars + 2 trailing = 1285 total)  -> confirmed

(confirmed = struct.calcsize() on the format strings below matches the
spec's stated total packet size exactly - see backend/tests/test_f1_2024_parser.py)

This is the first game year in this folder with real parsing enabled.
Every other year here is still a registered-but-unimplemented stub (see
packet_router.py's module docstring for why) - F1 23/25/26 are
structurally close per the games' own changelogs but not assumed
identical without their own verification pass.

Only CarTelemetryData (player car -> TelemetryFrame) is wired up so far.
LapData decoding (all-car positions/gaps -> LeaderboardSnapshot) is
parsed-but-unused below; wiring it into a LeaderboardSnapshot is the
next increment, not done in this pass.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass

from telemetry.models import GameTitle, TelemetryFrame, TelemetryMessage
from telemetry.packet_router import PacketHeader

_HEADER_FORMAT = "<HBBBBBQfIIBB"
_HEADER_SIZE = struct.calcsize(_HEADER_FORMAT)

_CAR_TELEMETRY_FORMAT = "<HfffBbHBBH4H4B4BH4f4B"
_CAR_TELEMETRY_SIZE = struct.calcsize(_CAR_TELEMETRY_FORMAT)

_LAP_DATA_FORMAT = "<IIHBHBHBHBfffBBBBBBBBBBBBBBBHHBfB"
_LAP_DATA_SIZE = struct.calcsize(_LAP_DATA_FORMAT)

_PACKET_ID_LAP_DATA = 2
_PACKET_ID_CAR_TELEMETRY = 6

_MAX_CARS = 22


def decode_header(raw: bytes) -> PacketHeader:
    """Public so tests (and a future LapData integration) can reuse it
    without re-parsing from scratch."""
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
    """One car's slice of a decoded CarTelemetryData packet - the fields
    RaceMind AI's TelemetryFrame actually needs; the packet carries more
    (brake/tyre temperatures, tyre pressures, rev lights) that isn't
    mapped yet since TelemetryFrame doesn't model it today."""

    speed_kph: int
    throttle: float  # 0.0-1.0
    steer: float  # -1.0 to 1.0
    brake: float  # 0.0-1.0
    gear: int  # 1-8, N=0, R=-1
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


class F1_2024Parser:
    """GameYearParser implementation for F1 24 (see packet_router.GameYearParser)."""

    game = GameTitle.F1_24

    def decode_packet(self, raw: bytes) -> TelemetryMessage | None:
        if len(raw) < _HEADER_SIZE:
            return None
        header = decode_header(raw)

        if header.packet_id == _PACKET_ID_CAR_TELEMETRY:
            return self._decode_car_telemetry_packet(raw, header)

        # LapData (id 2) and other packet types are not wired to a
        # TelemetryMessage yet - dropped, not guessed at.
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
