"""SessionIntent - "How many laps left?" Reports live session progress
directly from EngineerSessionState (total_laps - current_lap), the
same fields fuel_advisor and pit_window_advisor already read from the
same state - no advisor call needed since this is a direct fact, not
an engineering judgment. Not to be confused with session_analysis/,
which is post-session review (lap comparisons, stint summaries) rather
than a live "where are we right now" question.
"""

from __future__ import annotations

from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    laps_left = ctx.state.total_laps - ctx.state.current_lap
    text = "This is the last lap." if laps_left <= 0 else f"{laps_left} laps to go."
    return OllieResponse(text=text, primary=None, to_enqueue=[])
