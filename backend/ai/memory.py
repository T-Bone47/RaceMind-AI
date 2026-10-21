"""Short-lived, in-session conversational memory for the AI Engineer.

Distinct from `database.models.driver_profile.DriverProfile`, which is
the long-term, cross-session profile persisted to Postgres. This is a
rolling buffer of "what's happened and what's been said" scoped to a
single live session, so the AI Engineer doesn't need the driver to
repeat context every time they key the radio. It's in-process state on
purpose - if the process restarts mid-session the live telemetry
subscription would need to reconnect anyway, so there's nothing to gain
from persisting this to the database.
"""

from __future__ import annotations

import uuid
from collections import deque
from dataclasses import dataclass, field


@dataclass
class RadioExchange:
    question: str
    answer: str


@dataclass
class SessionMemory:
    session_id: uuid.UUID
    recent_events: deque[str] = field(default_factory=lambda: deque(maxlen=10))
    recent_exchanges: deque[RadioExchange] = field(default_factory=lambda: deque(maxlen=6))

    def record_event(self, description: str) -> None:
        self.recent_events.append(description)

    def record_exchange(self, question: str, answer: str) -> None:
        self.recent_exchanges.append(RadioExchange(question=question, answer=answer))

    def conversation_context(self) -> str:
        if not self.recent_exchanges:
            return ""
        lines = [f'Driver: "{e.question}" / You: "{e.answer}"' for e in self.recent_exchanges]
        return "Recent radio: " + " | ".join(lines)


class SessionMemoryStore:
    """In-memory registry of `SessionMemory`, one per live session. A thin
    wrapper rather than a bare dict so callers don't need to know the
    default-construction rule."""

    def __init__(self) -> None:
        self._sessions: dict[uuid.UUID, SessionMemory] = {}

    def get_or_create(self, session_id: uuid.UUID) -> SessionMemory:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionMemory(session_id=session_id)
        return self._sessions[session_id]

    def clear(self, session_id: uuid.UUID) -> None:
        self._sessions.pop(session_id, None)


# Process-wide singleton - mirrors how api/websocket/manager.py holds
# connection state. Swap for a Redis-backed store if the API ever runs
# as more than one process.
session_memory_store = SessionMemoryStore()
