"""Converts backend data into what Ollie actually says. This is the
only place spoken text gets chosen - handlers call into engineer/,
strategy/, or services/ and hand the result here, they don't compose
speech themselves.

Recommendation.message is already written short and direct (e.g.
"Pit window is open - box this lap or next.") because it's meant to be
read on a radio-style feed, not a dashboard report - so this module
speaks it verbatim rather than re-deriving phrasing. Re-deriving would
mean either parsing the advisor's own free text for numbers (fragile)
or re-running the underlying calculation a second time just to get a
different string for the same answer (wasteful, and a second place
that could drift from the advisor's own reasoning) - see the Step 2
report for why "speak the real message, don't paraphrase it" is the
directly-stated design choice here.
"""

from __future__ import annotations

from engineer.models import Recommendation, priority_rank
from voice.intents import templates
from voice.intents.models import OllieResponse


def build_response(recommendations: list[Recommendation], *, fallback: str) -> OllieResponse:
    """The standard path a handler uses once it has its advisor's
    output. Picks the highest-priority Recommendation's message as the
    spoken answer and carries the full list along as `to_enqueue` so
    the router pushes all of them onto the radio queue, not just the
    one spoken.

    Falls back to `fallback` (a templates.py phrase, chosen by the
    calling handler since only it knows which category-specific
    default applies) only when `recommendations` is empty - several
    advisors return [] when there's nothing notable to flag, which is
    correct for a *proactive* advisory but not an acceptable answer to
    a driver's direct question.
    """
    if not recommendations:
        return OllieResponse(text=fallback, primary=None, to_enqueue=[])
    primary = max(recommendations, key=lambda r: priority_rank(r.priority))
    return OllieResponse(text=primary.message, primary=primary, to_enqueue=recommendations)


def build_reasoning_response(recommendation: Recommendation | None) -> OllieResponse:
    """For a "why" follow-up: speaks the Recommendation's own reasoning
    instead of its message - the "why" was already computed and carried
    alongside the original answer, so this doesn't derive anything new.
    Never enqueued (to_enqueue=[]) since it's a clarification of an
    answer already queued once, not new engineering information.
    """
    if recommendation is None:
        return OllieResponse(text=templates.UNABLE_TO_CONFIRM, primary=None, to_enqueue=[])
    return OllieResponse(text=recommendation.reasoning, primary=recommendation, to_enqueue=[])
