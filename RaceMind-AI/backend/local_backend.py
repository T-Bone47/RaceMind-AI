import asyncio
import logging
import os
import sys
from pathlib import Path

# Ensure backend directory is in PYTHONPATH
sys.path.append(str(Path(__file__).parent.absolute()))

from config.settings import get_settings

# Force the database URL to use local SQLite BEFORE anything else imports it
local_db_path = Path.home() / ".racemind" / "racemind_local.db"
local_db_path.parent.mkdir(parents=True, exist_ok=True)

# Convert windows paths properly for SQLAlchemy sqlite URL
db_url_path = str(local_db_path.absolute()).replace("\\", "/")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_url_path}"

# Now we can import the rest safely
from alembic.config import Config
from alembic import command
import uvicorn
from api.main import app
from telemetry.models import GameTitle
from telemetry.udp_listener import UDPProvider

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("local_backend")

def run_migrations():
    """Run Alembic migrations programmatically."""
    logger.info("Running database migrations...")
    
    # We must construct the alembic config manually
    alembic_cfg = Config("alembic.ini")
    
    # Ensure the script location points to the actual alembic directory
    script_location = str(Path(__file__).parent / "alembic")
    alembic_cfg.set_main_option("script_location", script_location)
    
    # Run the upgrade
    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations complete.")
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        raise

from contextlib import asynccontextmanager
from fastapi import FastAPI
from api.main import lifespan as original_lifespan

async def start_udp_listener():
    """Start the native UDP listener as part of the FastAPI process."""
    settings = get_settings()
    udp_port = settings.udp_default_port
    
    logger.info(f"Starting embedded UDP listener on port {udp_port}")
    
    # Create the UDP provider
    udp_provider = UDPProvider(host="127.0.0.1", port=udp_port, game=GameTitle.F1_25_2026_DLC)
    
    # In order to route telemetry directly from UDP into the Websocket manager,
    # we can start a task that reads from the udp_provider stream and broadcasts it.
    from api.websocket.manager import manager
    import uuid
    import json
    
    live_session_id = uuid.UUID(int=0)
    
    async def bridge_telemetry():
        try:
            async for packet in udp_provider.stream():
                # We have to bypass the JSON dump inside the ingest if we want to send it to manager,
                # but manager.broadcast takes a dictionary payload!
                payload = packet.model_dump(mode="json")
                await manager.broadcast(live_session_id, payload)
        except Exception as e:
            logger.error(f"Telemetry bridging stopped: {e}")

    async def broadcast_agent_status():
        last_state = None
        while True:
            current_state = udp_provider.state.value
            if current_state != last_state:
                last_state = current_state
                payload = {
                    "type": "agent_status",
                    "status": current_state,
                    "port": udp_port
                }
                await manager.broadcast(live_session_id, payload)
            await asyncio.sleep(1)

    # Keep track of it
    app.state.udp_provider = udp_provider
    app.state.udp_task = asyncio.create_task(udp_provider.start())
    app.state.bridge_task = asyncio.create_task(bridge_telemetry())
    app.state.status_task = asyncio.create_task(broadcast_agent_status())

async def stop_udp_listener():
    if hasattr(app.state, "udp_provider"):
        await app.state.udp_provider.stop()
    if hasattr(app.state, "bridge_task"):
        app.state.bridge_task.cancel()
    if hasattr(app.state, "status_task"):
        app.state.status_task.cancel()
    if hasattr(app.state, "udp_task"):
        app.state.udp_task.cancel()

@asynccontextmanager
async def local_lifespan(_app: FastAPI):
    async with original_lifespan(_app):
        await start_udp_listener()
        try:
            yield
        finally:
            await stop_udp_listener()

app.router.lifespan_context = local_lifespan

def main():
    logger.info("Starting RaceMind Local Backend...")
    
    # 1. Run migrations (synchronous)
    run_migrations()
    
    # 2. Start API server
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    main()
