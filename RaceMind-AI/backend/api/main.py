from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.middleware import register_exception_handlers, request_logging_middleware
from api.routes import (
    ai,
    auth,
    circuit_setup,
    coaching,
    health,
    reference,
    session,
    strategy,
    telemetry,
    users,
    voice,
)
from api.websocket.routes import router as websocket_router
from config.logging_config import configure_logging
from config.settings import get_settings
from database.session import engine
from reference.fastf1_client import configure_cache as configure_fastf1_cache



settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    configure_logging(settings.log_level)
    configure_fastf1_cache(settings.fastf1_cache_dir)
    
    yield
    
    await engine.dispose()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.middleware("http")(request_logging_middleware)
    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(auth.router, prefix=settings.api_v1_prefix)
    app.include_router(users.router, prefix=settings.api_v1_prefix)
    app.include_router(session.router, prefix=settings.api_v1_prefix)
    app.include_router(telemetry.router, prefix=settings.api_v1_prefix)
    app.include_router(strategy.router, prefix=settings.api_v1_prefix)
    app.include_router(coaching.router, prefix=settings.api_v1_prefix)
    app.include_router(ai.router, prefix=settings.api_v1_prefix)
    app.include_router(voice.router, prefix=settings.api_v1_prefix)
    app.include_router(reference.router, prefix=settings.api_v1_prefix)
    app.include_router(circuit_setup.router, prefix=settings.api_v1_prefix)
    app.include_router(websocket_router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
# test reload
