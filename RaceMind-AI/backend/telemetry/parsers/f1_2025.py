"""Packet parser for F1 2025."""

from __future__ import annotations

import struct
import uuid
from typing import Dict, TypedDict

from telemetry.models import GameTitle, TelemetryMessage, TelemetryFrame


class LapState(TypedDict):
    lap_number: int
    lap_distance_m: float


class F12025Parser:
    """GameYearParser implementation for F1 2025 (see packet_router.GameYearParser)."""

    game = GameTitle.F1_25

    def __init__(self) -> None:
        # Cache the lap state per session to enrich CarTelemetry packets
        self._lap_state: Dict[int, LapState] = {}

    def decode_packet(self, raw: bytes) -> TelemetryMessage | None:
        if len(raw) < 29:
            return None
        
        # Header (29 bytes)
        # <HBBBBBQfIIBB
        # packet_format(0), game_year(1), game_major_version(2), game_minor_version(3),
        # packet_version(4), packet_id(5), session_uid(6), session_time(7),
        # frame_id(8), overall_frame_id(9), player_car_index(10), secondary_player_car_index(11)
        header = struct.unpack_from('<HBBBBBQfIIBB', raw, 0)
        packet_id = header[5]
        session_uid = header[6]
        player_car_index = header[10]
        
        if packet_id == 2:  # LapData
            # 29 byte header, 22 cars * 57 bytes per car
            offset = 29 + (player_car_index * 57)
            if len(raw) < offset + 57:
                return None
            
            # LapDistance is float at offset 20
            # CurrentLapNum is byte at offset 33
            lap_distance_m, = struct.unpack_from('<f', raw, offset + 20)
            lap_number, = struct.unpack_from('<B', raw, offset + 33)
            
            self._lap_state[session_uid] = {
                "lap_number": lap_number,
                "lap_distance_m": lap_distance_m
            }
            return None
            
        elif packet_id == 6:  # CarTelemetry
            # 29 byte header, 22 cars * 60 bytes per car
            offset = 29 + (player_car_index * 60)
            if len(raw) < offset + 60:
                return None
            
            # Speed: ushort (0), Throttle: float (2), Steer: float (6), Brake: float (10),
            # Clutch: byte (14), Gear: sbyte (15), EngineRPM: ushort (16), IsDrsOn: byte (18)
            speed_kph, throttle, steer, brake, _, gear, engine_rpm, drs = struct.unpack_from('<HfffBbHB', raw, offset)
            
            state = self._lap_state.get(session_uid, {"lap_number": None, "lap_distance_m": None})
            
            return TelemetryFrame(
                session_id=uuid.UUID(int=session_uid) if session_uid != 0 else None,
                lap_number=state["lap_number"],
                lap_distance_m=state["lap_distance_m"],
                speed_kph=speed_kph,
                throttle_pct=max(0.0, min(100.0, throttle * 100.0)),
                brake_pct=max(0.0, min(100.0, brake * 100.0)),
                steering=max(-1.0, min(1.0, steer)),
                gear=gear,
                engine_rpm=engine_rpm,
                drs_active=bool(drs)
            )

        return None
