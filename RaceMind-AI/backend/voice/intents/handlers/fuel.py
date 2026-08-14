"""FuelIntent - "Fuel?" Wraps engineer.fuel_advisor, called exactly as
engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import fuel_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = fuel_advisor.analyze(
        ctx.state.fuel_state, laps_to_finish=ctx.state.total_laps - ctx.state.current_lap
    )
    return response_builder.build_response(recommendations, fallback=templates.fuel_stable())
