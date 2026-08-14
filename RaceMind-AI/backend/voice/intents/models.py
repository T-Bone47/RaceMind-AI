"""Domain types for Ollie's intelligence layer.

Deliberately narrow: `Recommendation` and `EngineerSessionState`
already exist in engineer.models and are reused directly rather than
wrapped - the only new vocabulary this layer needs is which *question*
a driver asked (IntentType), and the small value types the
parser/router/handlers pass between each other to answer it.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum

from engineer.models import EngineerSessionState, Recommendation
from services.coaching_service import CoachingService


class IntentType(str, Enum):
    STRATEGY = "strategy"
    TYRE = "tyre"
    FUEL = "fuel"
    WEATHER = "weather"
    ERS = "ers"
    DRS = "drs"
    TELEMETRY = "telemetry"
    COACHING = "coaching"
    DAMAGE = "damage"
    SESSION = "session"
    UNKNOWN = "unknown"


class FollowUpType(str, Enum):
    """A follow-up doesn't carry new engineering data - it asks for more
    detail about the answer Ollie just gave. See context.py for how
    conversation history resolves these against the last exchange, and
    handlers/unknown.py for why only WHY is answered generally."""

    WHY = "why"
    WHEN = "when"


@dataclass(frozen=True)
class ParsedIntent:
    """What parser.py produces from raw driver speech."""

    intent_type: IntentType
    raw_text: str
    follow_up: FollowUpType | None = None


@dataclass(frozen=True)
class OllieResponse:
    """What a handler hands back to the router.

    `text` is what Ollie says. `primary` is the specific Recommendation
    `text` was drawn from, if any - kept separate from `to_enqueue`
    (rather than assuming it's always index 0) because response_builder
    picks the spoken one by *priority*, not list order, so callers that
    need "the one that was actually said" (follow-up resolution) can't
    reliably recover it from the enqueue list alone. `to_enqueue` is
    everything the router should feed to the existing radio queue -
    normally the handler's full advisor output, so lower-priority
    findings still reach the queue for later proactive delivery even
    though only the top one was spoken immediately.

    Empty `to_enqueue` for UnknownIntent and follow-up responses, which
    aren't new engineering advice and don't belong on the radio queue -
    see handlers/unknown.py and response_builder.build_reasoning_response.
    """

    text: str
    primary: Recommendation | None = None
    to_enqueue: list[Recommendation] = field(default_factory=list)


@dataclass
class HandlerContext:
    """Everything a handler might need to answer a driver's question.

    Not every handler uses every field - most only need `state`; only
    handlers/coaching.py needs `session_id` and `coaching_service`, since
    it calls the DB-backed CoachingService built in Phase 4. Bundled
    together so the router's dispatch is uniform no matter what a given
    handler actually needs.

    `coaching_service` is optional because this layer isn't wired into
    the live app yet (Step 2 scope, per the "do not build microphone
    capture" instruction) - a caller that hasn't constructed one gets a
    graceful "no session data" answer from handlers/coaching.py rather
    than a crash.
    """

    session_id: uuid.UUID
    state: EngineerSessionState
    coaching_service: CoachingService | None = None
