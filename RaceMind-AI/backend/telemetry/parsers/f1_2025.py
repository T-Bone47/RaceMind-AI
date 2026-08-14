"""F1 25 UDP telemetry parser.

Verified against the official F1 25 UDP specification: the header (29
bytes) and CarTelemetryData (1352 bytes total, 60 bytes/car, 22 cars)
are byte-identical to F1 24 - confirmed by cross-checking this file's
struct math against F1 25's own documented packet sizes, not assumed
from the version number. Because they're genuinely identical, this
subclasses F1_2024Parser rather than duplicating the same struct logic;
if F1 25 diverges in a future patch this can be split into its own
independent implementation the same way F1 26 already needed to be
(F1 26 changed engineTemperature's type and the max car count - see
f1_2026.py - so it could NOT reuse this pattern).
"""

from __future__ import annotations

from telemetry.models import GameTitle
from telemetry.parsers.f1_2024 import F1_2024Parser


class F1_2025Parser(F1_2024Parser):
    """GameYearParser implementation for F1 25 (see packet_router.GameYearParser)."""

    game = GameTitle.F1_25
