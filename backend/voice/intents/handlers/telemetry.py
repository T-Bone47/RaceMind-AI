"""TelemetryIntent - "Gap ahead?" Reports the live gap directly from
EngineerSessionState rather than calling an advisor: there's no
"telemetry advisor" that turns a gap into a Recommendation, since the
gap is already the measured answer - nothing to advise on. This is the
one handler that never produces a Recommendation and consequently
never enqueues onto the radio queue - a raw telemetry read isn't
proactive advice.

Checks the driver's own wording for "behind" to decide which gap to
report, since both "Gap ahead?" and "Gap behind?" parse to the same
TelemetryIntent - see parser.py's TELEMETRY keywords, which match
either word.
"""

from __future__ import annotations

from voice.intents import templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    asking_behind = "behind" in parsed.raw_text.lower()
    gap = ctx.state.gap_to_car_behind_s if asking_behind else ctx.state.gap_to_car_ahead_s
    label = "behind" if asking_behind else "ahead"

    if gap is None:
        return OllieResponse(text=templates.NO_TELEMETRY, primary=None, to_enqueue=[])
    return OllieResponse(text=f"Gap {label} {gap:.1f}.", primary=None, to_enqueue=[])
