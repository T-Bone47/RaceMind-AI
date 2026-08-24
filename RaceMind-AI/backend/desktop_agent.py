"""Standalone UDP-to-cloud telemetry bridge.

NOT currently launched by the Electron app - apps/desktop/electron/main.ts
spawns local_backend.py/.exe, which owns UDP reception, the local
FastAPI backend, and cloud forwarding (see local_backend.py's
bridge_telemetry_to_cloud) directly. This file (and desktop_agent.spec,
which still builds it into desktop_agent.exe) is kept in case a
lightweight standalone agent - without the local backend/database - is
useful again in the future, but as of this writing running it does
nothing for the shipped product; edit local_backend.py instead.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

import websockets

# Ensure the backend directory is in the PYTHONPATH so we can import modules
sys.path.append(str(Path(__file__).parent.absolute()))

from config.settings import get_settings
from telemetry.models import GameTitle
from telemetry.udp_listener import UDPProvider

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("desktop_agent")

async def run_bridge():
    settings = get_settings()
    
    # Configuration
    import uuid
    agent_id = os.environ.get("AGENT_ID", str(uuid.uuid4()))
    cloud_wss_url = os.environ.get("CLOUD_WSS_URL", f"wss://racemind-ai-backend.up.railway.app/ws/telemetry/ingest?agent_id={agent_id}")
    agent_secret = os.environ.get("AGENT_SECRET", settings.agent_secret)
    udp_port = int(os.environ.get("UDP_PORT", settings.udp_default_port))
    
    udp_provider = UDPProvider(host="0.0.0.0", port=udp_port, game=GameTitle.F1_25)
    await udp_provider.connect()
    
    # Wait briefly for connection state to resolve
    await asyncio.sleep(0.5)
    
    # We no longer exit on FAILED/PORT_CONFLICT immediately, because we want to tell the cloud our state.
    
    logger.info("WAITING FOR F1")
    logger.info(f"Listening on UDP port {udp_port}")
    
    headers = {"X-Agent-Secret": agent_secret}
    
    # Start the UDP provider in the background
    udp_task = asyncio.create_task(udp_provider.run())
    
    while True:
        try:
            logger.info(f"Connecting to cloud endpoint: {cloud_wss_url}")
            async with websockets.connect(cloud_wss_url, additional_headers=headers) as ws:
                logger.info("CLOUD CONNECTED")
                
                # We need a task to periodically send the agent status
                async def send_status():
                    import json
                    last_state = None
                    while True:
                        if udp_provider.state.name != last_state:
                            try:
                                await ws.send(json.dumps({
                                    "type": "agent_status",
                                    "status": udp_provider.state.name,
                                    "port": udp_port
                                }))
                                last_state = udp_provider.state.name
                            except Exception:
                                pass
                        await asyncio.sleep(1)
                        
                status_task = asyncio.create_task(send_status())
                
                # Stream packets as they arrive
                try:
                    async for packet in udp_provider.stream():
                        try:
                            # Also reset status if we are receiving data so UI shows "RECEIVING"
                            if udp_provider.state.name == "CONNECTED":
                                udp_provider.state.name = "RECEIVING"
                                
                            logger.debug("TELEMETRY ACTIVE")
                            await ws.send(packet.model_dump_json())
                        except websockets.exceptions.ConnectionClosed:
                            logger.warning("CLOUD DISCONNECTED")
                            break
                finally:
                    status_task.cancel()
        except Exception as e:
            logger.error(f"Connection failed: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(run_bridge())
    except KeyboardInterrupt:
        logger.info("Agent stopped.")
