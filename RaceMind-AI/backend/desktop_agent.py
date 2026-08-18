import asyncio
import os
import sys
from pathlib import Path
import websockets
import json
import logging

# Ensure the backend directory is in the PYTHONPATH so we can import modules
sys.path.append(str(Path(__file__).parent.absolute()))

from telemetry.udp_listener import UDPProvider
from telemetry.models import GameTitle
from config.settings import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("desktop_agent")

async def run_bridge():
    settings = get_settings()
    
    # Configuration
    cloud_wss_url = os.environ.get("CLOUD_WSS_URL", f"ws://localhost:8000/ws/telemetry/ingest")
    agent_secret = os.environ.get("AGENT_SECRET", settings.agent_secret)
    udp_port = int(os.environ.get("UDP_PORT", settings.udp_default_port))
    
    udp_provider = UDPProvider(host="0.0.0.0", port=udp_port, game=GameTitle.F1_25)
    await udp_provider.connect()
    
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
                
                # Stream packets as they arrive
                async for packet in udp_provider.stream():
                    # The stream yields validated Pydantic models from the parsers
                    try:
                        logger.debug("TELEMETRY ACTIVE")
                        await ws.send(packet.model_dump_json())
                    except websockets.exceptions.ConnectionClosed:
                        logger.warning("CLOUD DISCONNECTED")
                        break
        except Exception as e:
            logger.error(f"Connection failed: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(run_bridge())
    except KeyboardInterrupt:
        logger.info("Agent stopped.")
