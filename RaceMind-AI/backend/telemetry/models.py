"""Normalized telemetry data transfer objects.

Every concrete provider (UDP listener today; Assetto Corsa/iRacing/rFactor
2/etc adapters in the future) translates its source's native format into
`TelemetryFrame`/`TelemetryEvent`. Nothing downstream - the WebSocket
broadcaster, the strategy engine, the AI engineer, the recorder - ever
needs to know which sim or which game year produced the data.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class GameTitle(str, Enum):
    """Every sim RaceMind AI targets. F1_15-F1_26 have real UDP parser
    stubs today (see telemetry/parsers/); the rest are placeholders for
    the PluginProvider milestone."""

    F1_15 = "f1_15"
    F1_16 = "f1_16"
    F1_17 = "f1_17"
    F1_18 = "f1_18"
    F1_19 = "f1_19"
    F1_20 = "f1_20"
    F1_21 = "f1_21"
    F1_22 = "f1_22"
    F1_23 = "f1_23"
    F1_24 = "f1_24"
    F1_25 = "f1_25"
    F1_25_2026_DLC = "f1_25_2026_dlc"
    F2_25 = "f2_25"
    ASSETTO_CORSA = "assetto_corsa"
    ACC = "acc"
    IRACING = "iracing"
    LE_MANS_ULTIMATE = "le_mans_ultimate"
    RFACTOR_2 = "rfactor_2"


class TelemetryEventType(str, Enum):
    SESSION_STARTED = "session_started"
    SESSION_ENDED = "session_ended"
    LAP_COMPLETED = "lap_completed"
    PIT_ENTERED = "pit_entered"
    PIT_EXITED = "pit_exited"
    FLAG_CHANGED = "flag_changed"
    PENALTY_ISSUED = "penalty_issued"
    DRIVER_DNF = "driver_dnf"


def _utcnow() -> datetime:
    return datetime.now(UTC)


class TelemetryFrame(BaseModel):
    """One normalized telemetry sample - the "live" DTO streamed over
    the pub/sub bus and the WebSocket. See
    `database.models.telemetry.TelemetryFrameRecord` for the persisted
    counterpart; the API layer maps between the two."""

    type: str = "frame"
    session_id: uuid.UUID | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    lap_number: int | None = None
    lap_distance_m: float | None = None
    speed_kph: float
    throttle_pct: float = Field(ge=0, le=100)
    brake_pct: float = Field(ge=0, le=100)
    steering: float = Field(ge=-1, le=1)
    gear: int
    engine_rpm: float
    drs_active: bool = False


class TelemetryEvent(BaseModel):
    """A discrete happening (lap completed, pit entered, flag change, ...)
    rather than a continuous sample."""

    type: str = "event"
    session_id: uuid.UUID | None = None
    event_type: TelemetryEventType
    timestamp: datetime = Field(default_factory=_utcnow)
    payload: dict[str, Any] = Field(default_factory=dict)


class LeaderboardEntry(BaseModel):
    """One driver's live standing. Real F1 game UDP telemetry broadcasts
    this for every car in the session (not just the player's), so this
    is a first-class part of the abstraction rather than bolted on -
    see telemetry/packet_router.py for why decoding it is still a
    registered-but-unimplemented parser stub today."""

    driver_index: int  # position in the game's car array, not race position
    driver_name: str
    position: int
    gap_to_leader_s: float | None = None
    gap_to_ahead_s: float | None = None
    last_lap_ms: int | None = None
    best_lap_ms: int | None = None
    current_lap: int
    tyre_compound: str | None = None
    pit_stops: int = 0
    is_player: bool = False


class LeaderboardSnapshot(BaseModel):
    """Live timing for every driver in the session at one moment -
    the multi-car counterpart to the single-car TelemetryFrame."""

    type: str = "leaderboard"
    session_id: uuid.UUID | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    entries: list[LeaderboardEntry] = Field(default_factory=list)


TelemetryMessage = TelemetryFrame | TelemetryEvent | LeaderboardSnapshot
