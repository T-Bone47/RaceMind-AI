"""WeatherIntent - "Weather?" Wraps engineer.weather_advisor, called
exactly as engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import weather_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = weather_advisor.analyze(
        ctx.state.weather, ctx.state.tyre_state.compound, ctx.state.weather_forecast
    )
    return response_builder.build_response(recommendations, fallback=templates.weather_stable())
