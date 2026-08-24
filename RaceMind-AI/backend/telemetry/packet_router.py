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

Real, verified decoding exists today for F1 25 and the F1 25: 2026
Season Pack DLC (see telemetry/parsers/f1_2025.py and
f1_2025_2026_dlc.py); every other registered year is architecture-only
and raises NotImplementedError, which `route()` treats as "nothing to
publish for this packet" rather than an error.
"""

from __future__ import annotations

import logging
import struct
from dataclasses import dataclass
from typing import Protocol

from telemetry.models import GameTitle, TelemetryMessage

logger = logging.getLogger(__name__)

# Every currently-supported game year (F1 23+) shares this 29-byte
# header layout; only packet *bodies* diverge. See each parser's
# decode_packet for the field-by-field breakdown - duplicated there
# rather than imported from here because a parser must be able to
# decode its own header even if this module's assumptions ever stop
# matching a future year.
_HEADER_STRUCT = "<HBBBBBQfIIBB"
_HEADER_SIZE = struct.calcsize(_HEADER_STRUCT)


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


def peek_header(raw: bytes) -> PacketHeader | None:
    """Decode just the fixed header every F1 23+ packet starts with,
    without touching the per-packet-type body. Returns None if `raw` is
    too short to contain one (not a crash - just "not decodable yet")."""
    if len(raw) < _HEADER_SIZE:
        return None
    fields = struct.unpack_from(_HEADER_STRUCT, raw, 0)
    return PacketHeader(
        packet_id=fields[5],
        packet_format=fields[0],
        game_year=fields[1],
        session_uid=fields[6],
        session_time=fields[7],
        frame_identifier=fields[8],
        player_car_index=fields[10],
    )


# m_packetFormat is the season/format the *player* selected under
# Settings -> UDP Telemetry Settings -> UDP Format (see
# docs/TELEMETRY_SETUP.md) - e.g. literally 2025 or 2026 - not a
# RaceMind invention. That makes it the correct signal for picking a
# parser automatically per packet, rather than trusting whichever
# GameTitle a provider happened to be constructed with.
_PACKET_FORMAT_TO_GAME: dict[int, GameTitle] = {
    2025: GameTitle.F1_25,
    2026: GameTitle.F1_25_2026_DLC,
}


def detect_game(header: PacketHeader) -> GameTitle | None:
    """Map a decoded header to the GameTitle whose parser understands
    it, or None if RaceMind doesn't have a real parser for this
    packet_format yet."""
    return _PACKET_FORMAT_TO_GAME.get(header.packet_format)


class GameYearParser(Protocol):
    """One implementation per supported game year (see telemetry/parsers/).

    Takes the *whole* raw datagram rather than a pre-split header/body,
    because header length itself varies by game year - only the parser
    for a given year actually knows where its header ends. `PacketHeader`
    above is the shape a parser decodes into internally and can attach
    to whatever it returns; the router doesn't touch packet bytes at all.

    `decode_packet` raises NotImplementedError for every game year that
    doesn't have real parsing yet - see module docstring above for which
    years currently do.
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
        self._unrecognized_formats_logged: set[int] = set()
        self.last_detected_game: GameTitle | None = None

    def register(self, parser: GameYearParser) -> None:
        self._parsers[parser.game] = parser
        logger.debug("Registered telemetry parser for %s", parser.game.value)

    def get(self, game: GameTitle) -> GameYearParser | None:
        return self._parsers.get(game)

    def route(self, game: GameTitle, raw: bytes) -> TelemetryMessage | None:
        """Decode `raw` with the parser explicitly registered for `game`.

        Prefer `route_auto` for live traffic. This stays around for
        callers that already know the game year for certain (tests,
        replaying a recorded session) and is what `route_auto` itself
        calls once it's picked a year.
        """
        parser = self._parsers.get(game)
        if parser is None:
            logger.debug("No parser registered for %s; dropping packet", game.value)
            return None
        try:
            return parser.decode_packet(raw)
        except NotImplementedError:
            return None
        except Exception as exc:  # noqa: BLE001 - untrusted network input; one bad packet must never kill the receive loop
            logger.warning("[TELEMETRY] Parser error (%s): %s", game.value, exc)
            return None

    def route_auto(self, raw: bytes, fallback: GameTitle | None = None) -> TelemetryMessage | None:
        """Decode `raw` using whichever parser its own header identifies.

        Falls back to `fallback` - typically whatever GameTitle a
        provider was configured with - when the header is too short to
        read, or its packet_format isn't one RaceMind has a real parser
        for yet, so telemetry still flows against an unrecognized format
        rather than silently going dark.
        """
        header = peek_header(raw)
        game = detect_game(header) if header is not None else None
        if game is None:
            if header is not None and header.packet_format not in self._unrecognized_formats_logged:
                self._unrecognized_formats_logged.add(header.packet_format)
                logger.warning(
                    "[TELEMETRY] Unrecognized packet_format=%s (falling back to %s). "
                    "If you're on a supported game, RaceMind's parser may need updating.",
                    header.packet_format,
                    fallback.value if fallback else "none",
                )
            game = fallback
        if game is None:
            return None
        self.last_detected_game = game
        return self.route(game, raw)
