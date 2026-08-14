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


manager = ConnectionManager()
