"""Short-term conversational memory - just enough to resolve a natural
follow-up like "Why?" against the answer Ollie just gave, not a full
chatbot transcript. Per the Step 2 spec: "Do NOT build a full chatbot
memory. Only maintain enough conversational state to answer follow-up
questions naturally."

This module deliberately only stores what was asked and said - it has
no engineering domain logic of its own. Resolving a follow-up that
needs *fresh* state (e.g. "When then?" re-deriving a pit lap from the
current EngineerSessionState) is router.py's job, not this module's;
ConversationContext just answers "what did we just talk about."
"""

from __future__ import annotations

from dataclasses import dataclass

from engineer.models import Recommendation
from voice.intents.models import IntentType

DEFAULT_MAX_HISTORY = 3


@dataclass(frozen=True)
class Exchange:
    """One driver question and Ollie's answer to it."""

    intent_type: IntentType
    raw_text: str
    response_text: str
    recommendation: Recommendation | None  # the specific Recommendation `response_text` was drawn from, if any


class ConversationContext:
    """A bounded history of recent exchanges. `max_history` caps how
    far back a follow-up can reach; older exchanges are forgotten
    rather than kept indefinitely - this is short-term memory for
    natural back-and-forth, not a session transcript."""

    def __init__(self, max_history: int = DEFAULT_MAX_HISTORY) -> None:
        self._history: list[Exchange] = []
        self._max_history = max_history

    def record(self, exchange: Exchange) -> None:
        self._history.append(exchange)
        if len(self._history) > self._max_history:
            self._history = self._history[-self._max_history :]

    def last(self) -> Exchange | None:
        return self._history[-1] if self._history else None

    def clear(self) -> None:
        self._history.clear()
