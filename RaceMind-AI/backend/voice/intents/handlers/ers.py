"""ERSIntent - "Battery?" Wraps engineer.ers_advisor, called exactly as
engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import ers_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = ers_advisor.analyze(ctx.state.ers_state)
    return response_builder.build_response(recommendations, fallback=templates.ers_status(ctx.state.ers_state))
