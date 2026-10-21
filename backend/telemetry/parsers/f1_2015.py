"""Packet parser for F1 2015.

TODO (future milestone): implement `decode_packet` against the official
F1 2015 UDP telemetry specification. Every field offset below the
common header differs release to release, so this stays a registered-but-
unimplemented stub rather than a guess - see telemetry/packet_router.py
for why that boundary is deliberate.
"""

from __future__ import annotations

from telemetry.models import GameTitle, TelemetryMessage


class F12015Parser:
    """GameYearParser implementation for F1 2015 (see packet_router.GameYearParser)."""

    game = GameTitle.F1_15

    def decode_packet(self, raw: bytes) -> TelemetryMessage | None:
        raise NotImplementedError(
            "F1 2015 packet decoding is not implemented yet - "
            "register the real parser here once the wire format is confirmed."
        )
