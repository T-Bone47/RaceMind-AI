from __future__ import annotations

import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from api.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/telemetry/{session_id}")
async def telemetry_socket(websocket: WebSocket, session_id: uuid.UUID) -> None:
    """Dashboard clients connect here to receive a live telemetry feed for
    a session. Broadcasting into a room happens from wherever a
    TelemetryProvider is running (see telemetry/provider.py) via
    `manager.broadcast(session_id, message)`; this endpoint's own receive
    loop just keeps the connection open and detects client disconnects.
    """
    await manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
