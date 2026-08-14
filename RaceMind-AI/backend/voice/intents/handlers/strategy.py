"""StrategyIntent - "Should I pit?" Combines the strategy-relevant
advisors exactly as engineer.advisor.EngineeringAdvisor calls them:
pit_window_advisor (the core "when to pit" call) plus
undercut/overcut/push_conserve (the gap-driven tactical signals a
driver asking about strategy also wants folded in). Deliberately
doesn't call flag_advisor or the tyre/fuel/damage/weather advisors -
those answer different questions (TyreIntent, FuelIntent, etc.), and
re-running them here would mean StrategyIntent's answer duplicates
work another intent already owns.
"""

from __future__ import annotations

from engineer import overcut_advisor, pit_window_advisor, push_conserve_advisor, undercut_advisor
from voice.intents import response_builder, templates
from voice.intents.models import HandlerContext, OllieResponse, ParsedIntent


async def handle(parsed: ParsedIntent, ctx: HandlerContext) -> OllieResponse:
    state = ctx.state
    recommendations = pit_window_advisor.analyze(
        current_lap=state.current_lap,
        total_laps=state.total_laps,
        tyre_state=state.tyre_state,
        fuel_state=state.fuel_state,
    )
    recommendations += undercut_advisor.analyze(gap_to_car_ahead_s=state.gap_to_car_ahead_s)
    recommendations += overcut_advisor.analyze(gap_to_car_behind_s=state.gap_to_car_behind_s)
    recommendations += push_conserve_advisor.analyze(
        gap_to_car_ahead_s=state.gap_to_car_ahead_s,
        gap_to_car_behind_s=state.gap_to_car_behind_s,
    )
    # pit_window_advisor.analyze() always returns exactly one
    # Recommendation unconditionally (no is_viable gate - see its
    # source), so `recommendations` is never actually empty here. The
    # fallback below is defensive only; it's the honest "can't confirm"
    # phrase rather than a specific-sounding but unfounded guess, in
    # case that assumption ever stops holding.
    return response_builder.build_response(recommendations, fallback=templates.UNABLE_TO_CONFIRM)
