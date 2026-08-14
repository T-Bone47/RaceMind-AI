"""Routes a raw UDP datagram to the right per-game-year decoder.

This is architecture, not a parser: the header layout AND each packet
body's byte layout differ across F1 game years (fields like the session
UID width and frame-identifier counters have changed release to
release), and guessing at those offsets without the official
Codemasters/EA UDP specification open next to the code would silently
produce wrong telemetry - worse than an error, because it wouldn't look
wrong. `GameYearParser` is the contract each `telemetry/parsers/f1_*.py`
module implements once that spec work happens; `PacketRouter` is the
dispatch table that makes plugging one in a one-line registration.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Protocol

from telemetry.models import GameTitle, TelemetryMessage

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class PacketHeader:
    """Fields common to every packet in a session, once decoded."""

    packet_id: int
    packet_format: int
    game_year: int
    session_uid: int
    session_time: float
    frame_identifier: int
    player_car_index: int


class GameYearParser(Protocol):
    """One implementation per supported game year (see telemetry/parsers/).

    Takes the *whole* raw datagram rather than a pre-split header/body,
    because header length itself varies by game year - only the parser
    for a given year actually knows where its header ends. `PacketHeader`
    above is the shape a parser decodes into internally and can attach
    to whatever it returns; the router doesn't touch packet bytes at all.

    `decode_packet` is intentionally unimplemented in every f1_20xx.py
    stub today - see module docstring above.
    """

    game: GameTitle

    def decode_packet(self, raw: bytes) -> TelemetryMessage | None:
        """Return a normalized TelemetryFrame/TelemetryEvent, or None for
        packet types this parser doesn't translate (yet)."""
        ...


class PacketRouter:
    """Dispatch table from GameTitle -> GameYearParser."""

    def __init__(self) -> None:
        self._parsers: dict[GameTitle, GameYearParser] = {}

    def register(self, parser: GameYearParser) -> None:
        self._parsers[parser.game] = parser
        logger.debug("Registered telemetry parser for %s", parser.game.value)

    def get(self, game: GameTitle) -> GameYearParser | None:
        return self._parsers.get(game)

    def route(self, game: GameTitle, raw: bytes) -> TelemetryMessage | None:
        parser = self._parsers.get(game)
        if parser is None:
            logger.debug("No parser registered for %s; dropping packet", game.value)
            return None
        try:
            return parser.decode_packet(raw)
        except NotImplementedError:
            return None
