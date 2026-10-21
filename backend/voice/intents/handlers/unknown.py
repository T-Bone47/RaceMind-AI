"""UnknownIntent - the driver asked something Ollie doesn't recognize.
Per the Step 2 spec: "If Ollie cannot answer, do NOT hallucinate,"
"Never invent engineering advice" - this never calls a backend module
or guesses at an answer, it just says so. Not engineering advice, so
it doesn't produce a Recommendation and never touches the radio queue.
"""

from __future__ import annotations

from voice.intents import templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])
