"""DamageIntent - "Damage?" Wraps engineer.damage_advisor, called
exactly as engineer.advisor.EngineeringAdvisor already calls it.
"""

from __future__ import annotations

from engineer import damage_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    recommendations = damage_advisor.analyze(ctx.state.car_damage)
    return response_builder.build_response(recommendations, fallback=templates.damage_none(ctx.state.car_damage))
