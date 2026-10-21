"""DRSIntent - "Do I have DRS?" Wraps engineer.drs_advisor, called
exactly as engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import drs_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = drs_advisor.analyze(ctx.state.drs)
    return response_builder.build_response(recommendations, fallback=templates.drs_status(ctx.state.drs))
