"""Fallback phrases for Ollie's spoken answers.

response_builder.py's default is to speak the top Recommendation's
`.message` verbatim - advisor messages are already written short and
direct (e.g. "Pit window is open - box this lap or next."), so this
module doesn't re-derive phrasing from scratch. What it's for instead:
several advisors (drs_advisor, ers_advisor, damage_advisor, and
push/undercut/overcut) follow a "silent unless there's something to
flag" convention and return `[]` when nothing's notable - correct for
a *proactive* advisory, but a driver who directly asks "Battery?"
still needs an answer, not silence. These are that answer: short,
either static or built from the same measured EngineerSessionState
fields the advisors themselves read, never invented.
"""

from __future__ import annotations

from engineer.models import CarDamageState, DRSContext, ERSState

# --- Unknown / can't-answer (verbatim per the Step 2 spec - never vary
# these into something that sounds like a guess) ---

NO_SESSION_DATA = "I don't have enough session data."
UNABLE_TO_CONFIRM = "Unable to confirm."
NO_TELEMETRY = "No telemetry available."


# --- Per-category "nothing to flag" defaults ---


def tyre_stable() -> str:
    return "Tyres are good."


def fuel_stable() -> str:
    return "Fuel's stable."


def weather_stable() -> str:
    return "Conditions stable."


def damage_none(damage: CarDamageState) -> str:
    if damage.max_damage_pct <= 0.0:
        return "No damage."
    return f"Damage {damage.max_damage_pct:.0f} percent, holding."


def ers_status(ers: ERSState) -> str:
    return f"Battery {ers.state_of_charge_pct:.0f} percent."


def drs_status(drs: DRSContext) -> str:
    if not drs.enabled:
        return "DRS not enabled."
    if drs.in_zone:
        return "DRS available."
    return "No DRS zone."
