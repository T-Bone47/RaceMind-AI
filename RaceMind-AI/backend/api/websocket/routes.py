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


@router.websocket("/ws/telemetry/ingest")
async def telemetry_ingest(websocket: WebSocket) -> None:
    """The Desktop Companion (Telemetry Agent) connects here to stream
    decoded UDP packets into the cloud backend.
    """
    from config.settings import get_settings
    import json
    
    settings = get_settings()
    
    # Authenticate via header or query parameter
    agent_secret = websocket.headers.get("x-agent-secret") or websocket.query_params.get("token")
    if agent_secret != settings.agent_secret:
        await websocket.close(code=1008, reason="Invalid Agent Secret")
        return

    await websocket.accept()
    live_session_id = uuid.UUID(int=0)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast the incoming telemetry packet to all connected dashboard clients
            try:
                payload = json.loads(data)
                await manager.broadcast(live_session_id, payload)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
