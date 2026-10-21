from __future__ import annotations

import logging
import uuid

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Tracks live WebSocket connections per session so telemetry can be
    broadcast to every dashboard currently watching that session."""

    def __init__(self) -> None:
        self._rooms: dict[uuid.UUID, set[WebSocket]] = {}

    async def connect(self, session_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self._rooms.setdefault(session_id, set()).add(websocket)

    def disconnect(self, session_id: uuid.UUID, websocket: WebSocket) -> None:
        room = self._rooms.get(session_id)
        if room is None:
            return
        room.discard(websocket)
        if not room:
            del self._rooms[session_id]

    async def broadcast(self, session_id: uuid.UUID, message: dict[str, object]) -> None:
        for websocket in list(self._rooms.get(session_id, ())):
            try:
                await websocket.send_json(message)
            except Exception:
                logger.warning("Dropping unresponsive WebSocket for session %s", session_id)
                self.disconnect(session_id, websocket)


class IngestManager:
    """Tracks active telemetry ingestion connections from desktop agents.
    Ensures that only one connection per agent ID is active at a time.
    """

    def __init__(self) -> None:
        self._agents: dict[str, WebSocket] = {}

    async def connect(self, agent_id: str, websocket: WebSocket) -> None:
        if agent_id in self._agents:
            logger.warning(f"Agent {agent_id} re-connected, terminating old connection.")
            try:
                # 1008 is Policy Violation
                await self._agents[agent_id].close(code=1008, reason="Duplicate connection")
            except Exception:
                pass
        
        await websocket.accept()
        self._agents[agent_id] = websocket

    def disconnect(self, agent_id: str, websocket: WebSocket) -> None:
        if self._agents.get(agent_id) == websocket:
            del self._agents[agent_id]


manager = ConnectionManager()
ingest_manager = IngestManager()

