"""Per-game-year UDP packet parsers.

`register_all()` wires every year (2015-2026) into a PacketRouter so the
transport layer always has *something* registered - years without real
parsing yet just return None (see packet_router.py).

Real, verified parsing exists for F1 24, F1 25, and F1 26 (see each
module's docstring for exactly what was verified and against what
source). Every other year's `decode_packet` raises NotImplementedError,
which the router already handles by treating it as "nothing to publish
this packet."
"""

from __future__ import annotations

from telemetry.packet_router import GameYearParser, PacketRouter
from telemetry.parsers.f1_2015 import F12015Parser
from telemetry.parsers.f1_2016 import F12016Parser
from telemetry.parsers.f1_2017 import F12017Parser
from telemetry.parsers.f1_2018 import F12018Parser
from telemetry.parsers.f1_2019 import F12019Parser
from telemetry.parsers.f1_2020 import F12020Parser
from telemetry.parsers.f1_2021 import F12021Parser
from telemetry.parsers.f1_2022 import F12022Parser
from telemetry.parsers.f1_2023 import F12023Parser
from telemetry.parsers.f1_2024 import F1_2024Parser
from telemetry.parsers.f1_2025 import F1_2025Parser
from telemetry.parsers.f1_2026 import F1_2026Parser

_STUB_PARSERS: list[GameYearParser] = [
    F12015Parser(),
    F12016Parser(),
    F12017Parser(),
    F12018Parser(),
    F12019Parser(),
    F12020Parser(),
    F12021Parser(),
    F12022Parser(),
    F12023Parser(),
    # F1 24, 25, 26 deliberately excluded here - registered separately
    # below as real implementations, not stubs.
]

_REAL_PARSERS: list[GameYearParser] = [
    F1_2024Parser(),
    F1_2025Parser(),
    F1_2026Parser(),
]


def register_all(router: PacketRouter) -> None:
    """Registers every year - F1 24/25/26 with real parsing, every other
    year as its documented stub. Safe to call once at startup."""
    for parser in _REAL_PARSERS:
        router.register(parser)
    for stub in _STUB_PARSERS:
        router.register(stub)
