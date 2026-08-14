"""TyreIntent - "How are my tyres?" Wraps engineer.tyre_advisor, called
exactly as engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import tyre_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = tyre_advisor.analyze(ctx.state.tyre_state)
    return response_builder.build_response(recommendations, fallback=templates.tyre_stable())
