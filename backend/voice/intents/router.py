"""The top-level entry point for Ollie's intelligence layer: parses a
driver's transcribed speech into an intent, dispatches to the matching
handler (or resolves a short follow-up against recent conversation
context), and returns what Ollie should say - while also feeding any
Recommendation(s) into the existing radio queue (radio/queue.py) so
proactive advisories and driver-initiated answers share one
priority/dedup/throttle story rather than two. See radio/models.py's
own docstring, which already anticipated "a second message source
(e.g. a driver-initiated question)" feeding this exact queue.

Not wired into microphone capture, speaker playback, or the API layer
yet - this is the intelligence layer itself, per the Step 2 scope.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from engineer.models import RecommendationCategory
from radio.queue import RadioMessageQueue
from strategy.pit_window import calculate as calculate_pit_window
from voice.intents import parser, response_builder, templates
from voice.intents.context import ConversationContext, Exchange
from voice.intents.handlers import coaching as coaching_handler
from voice.intents.handlers import damage as damage_handler
from voice.intents.handlers import drs as drs_handler
from voice.intents.handlers import ers as ers_handler
from voice.intents.handlers import fuel as fuel_handler
from voice.intents.handlers import session as session_handler
from voice.intents.handlers import strategy as strategy_handler
from voice.intents.handlers import telemetry as telemetry_handler
from voice.intents.handlers import tyre as tyre_handler
from voice.intents.handlers import unknown as unknown_handler
from voice.intents.handlers import weather as weather_handler
from voice.intents.models import (
    FollowUpType,
    HandlerContext,
    IntentType,
    OllieResponse,
    ParsedIntent,
)

_Handler = Callable[[ParsedIntent, HandlerContext], Awaitable[OllieResponse]]

_HANDLERS: dict[IntentType, _Handler] = {
    IntentType.STRATEGY: strategy_handler.handle,
    IntentType.TYRE: tyre_handler.handle,
    IntentType.FUEL: fuel_handler.handle,
    IntentType.WEATHER: weather_handler.handle,
    IntentType.ERS: ers_handler.handle,
    IntentType.DRS: drs_handler.handle,
    IntentType.TELEMETRY: telemetry_handler.handle,
    IntentType.COACHING: coaching_handler.handle,
    IntentType.DAMAGE: damage_handler.handle,
    IntentType.SESSION: session_handler.handle,
    IntentType.UNKNOWN: unknown_handler.handle,
}


class OllieRouter:
    """Owns one RadioMessageQueue and one ConversationContext for a
    session's worth of Q&A - construct one per live session, not one
    globally, so different sessions' conversations and throttle state
    don't bleed into each other."""

    def __init__(self, radio_queue: RadioMessageQueue, context: ConversationContext | None = None) -> None:
        self._radio_queue = radio_queue
        self._context = context or ConversationContext()

    async def handle_utterance(self, raw_text: str, ctx: HandlerContext) -> OllieResponse:
        parsed = parser.parse(raw_text)

        if parsed.follow_up is not None:
            response = self._resolve_follow_up(parsed, ctx)
        else:
            handler = _HANDLERS[parsed.intent_type]
            response = await handler(parsed, ctx)

        if response.to_enqueue:
            self._radio_queue.enqueue(response.to_enqueue)

        self._context.record(
            Exchange(
                intent_type=parsed.intent_type,
                raw_text=raw_text,
                response_text=response.text,
                recommendation=response.primary,
            )
        )
        return response

    def _resolve_follow_up(self, parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
        last = self._context.last()

        if parsed.follow_up == FollowUpType.WHY:
            recommendation = last.recommendation if last is not None else None
            return response_builder.build_reasoning_response(recommendation)

        if parsed.follow_up == FollowUpType.WHEN:
            return self._resolve_when(last, ctx)

        return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])

    def _resolve_when(self, last: Exchange | None, ctx: HandlerContext) -> OllieResponse:
        # Only strategy/pit-window follow-ups have a concrete lap number
        # to give - other categories don't carry one, so this
        # deliberately doesn't try to fake a "when" for them. Re-derives
        # the lap from *current* state (not whatever state produced the
        # original answer, which may now be stale) via the same
        # strategy.pit_window.calculate() pit_window_advisor already
        # uses - not by parsing a lap number out of previously-spoken text.
        if last is None or last.recommendation is None:
            return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])
        if last.recommendation.category != RecommendationCategory.PIT_WINDOW:
            return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])

        window = calculate_pit_window(
            current_lap=ctx.state.current_lap,
            total_laps=ctx.state.total_laps,
            tyre_state=ctx.state.tyre_state,
            fuel_state=ctx.state.fuel_state,
        )
        return OllieResponse(text=f"Lap {window.optimal_lap}.", primary=None, to_enqueue=[])
