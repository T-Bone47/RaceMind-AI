"""CoachingIntent - "How was Turn 4?" Wraps services.coaching_service.
CoachingService.generate_report() (built in Phase 4) - the only DB-backed,
genuinely async handler in this package; see HandlerContext's docstring
for why `coaching_service` is optional at this stage.

Corner numbering here is corner_detection.py's own detection-order
index (see coaching/corner_detection.py's docstring: "detects corners
from telemetry signal alone, no track map needed"), not an official
track-map turn number - the closest honest match available without a
track map anywhere in this codebase, so "Turn 4" is answered as
corner index 4.

A CornerCoachingTip carries three separate phase messages (entry/mid/
exit) plus an optional potential_gain_kph - reading all three aloud
would violate Ollie's terseness, so this picks one representative
line: the potential gain if there is one (the most concrete, actionable
detail), otherwise the mid-corner (apex) feedback.
"""

from __future__ import annotations

import re

from fastapi import HTTPException

from voice.intents import templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent

_TURN_NUMBER = re.compile(r"(?:turn|corner)\s+(\d+)", re.IGNORECASE)


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    if ctx.coaching_service is None:
        return OllieResponse(text=templates.NO_SESSION_DATA, primary=None, to_enqueue=[])

    match = _TURN_NUMBER.search(parsed.raw_text)
    if match is None:
        return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])
    corner_number = int(match.group(1))

    try:
        report = await ctx.coaching_service.generate_report(ctx.session_id)
    except HTTPException:
        # Session not found, or not enough laps/telemetry recorded yet
        # (see CoachingService.generate_report's 404/409 cases) - either
        # way, honest "don't have it" beats guessing.
        return OllieResponse(text=templates.NO_TELEMETRY, primary=None, to_enqueue=[])

    tip = next((t for t in report.corner_tips if t.corner.index == corner_number), None)
    if tip is None:
        return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])

    if tip.potential_gain_kph is not None:
        text = f"Turn {corner_number}: {tip.potential_gain_kph:.1f} kph available."
    else:
        text = tip.mid.message

    return OllieResponse(text=text, primary=None, to_enqueue=[])
