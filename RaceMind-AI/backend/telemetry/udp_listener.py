"""Live UDP telemetry listener.

Owns the socket and the receive loop - that part is fully real and
testable today. Decoding is delegated entirely to `PacketRouter`, which
in turn delegates to a per-game-year parser (see telemetry/parsers/).
Until those parsers are implemented, `run()` still executes end to end;
it just has nothing registered to decode with, so it drops packets
after logging them at debug level. That's a deliberate, visible "not
implemented yet" rather than a silent wrong answer.
"""

from __future__ import annotations

import asyncio
import contextlib
import enum
import logging
from collections.abc import Callable

from telemetry.models import GameTitle
from telemetry.packet_router import PacketRouter
from telemetry.parsers import register_all as register_all_parsers
from telemetry.provider import TelemetryProvider

logger = logging.getLogger(__name__)

_PACKET_QUEUE_SIZE = 5000


class ConnectionState(enum.Enum):
    DISCONNECTED = "DISCONNECTED"
    CONNECTING = "CONNECTING"
    CONNECTED = "CONNECTED"
    STOPPING = "STOPPING"
    FAILED = "FAILED"
    PORT_CONFLICT = "PORT_CONFLICT"


def _default_router() -> PacketRouter:
    router = PacketRouter()
    register_all_parsers(router)
    return router


class _TelemetryDatagramProtocol(asyncio.DatagramProtocol):
    def __init__(self, on_packet: Callable[[bytes], None]) -> None:
        self._on_packet = on_packet

    def datagram_received(self, data: bytes, addr: tuple[str, int]) -> None:  # noqa: ARG002
        self._on_packet(data)

    def error_received(self, exc: Exception) -> None:
        logger.warning("UDP socket error: %s", exc)


class UDPProvider(TelemetryProvider):
    """Receives live UDP telemetry broadcast by a running game session.
    Automatically handles socket conflicts, ensuring the REST API isn't blocked
    if the port is in use during hot reloads.
    """

    def __init__(
        self,
        host: str = "0.0.0.0",
        port: int = 20777,
        game: GameTitle = GameTitle.F1_25_2026_DLC,
        router: PacketRouter | None = None,
    ) -> None:
        super().__init__()
        self.host = host
        self.port = port
        self.game = game
        self.router = router or _default_router()
        self.state = ConnectionState.DISCONNECTED
        self._transport: asyncio.DatagramTransport | None = None
        self._connection_task: asyncio.Task[None] | None = None
        self._packet_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=_PACKET_QUEUE_SIZE)

    async def connect(self) -> None:
        """Start the background maintenance loop to bind the UDP port.
        Idempotent; safe to call multiple times.
        """
        if self.state in (ConnectionState.CONNECTING, ConnectionState.CONNECTED):
            return

        self.state = ConnectionState.CONNECTING
        self._connection_task = asyncio.create_task(self._maintain_connection())

    async def _maintain_connection(self) -> None:
        loop = asyncio.get_running_loop()
        while self.state in (ConnectionState.CONNECTING, ConnectionState.CONNECTED, ConnectionState.FAILED, ConnectionState.PORT_CONFLICT):
            if self._transport is None:
                self.state = ConnectionState.CONNECTING
                try:
                    self._transport, _ = await loop.create_datagram_endpoint(
                        lambda: _TelemetryDatagramProtocol(self._on_packet),
                        local_addr=(self.host, self.port),
                    )
                    self.state = ConnectionState.CONNECTED
                    logger.info("UDPProvider listening on %s:%d for %s", self.host, self.port, self.game.value)
                except OSError as e:
                    # 10048 is WSAEADDRINUSE (Address already in use) on Windows
                    # 98 is EADDRINUSE on Linux
                    if getattr(e, "winerror", None) == 10048 or getattr(e, "errno", None) in (98, 48):
                        self.state = ConnectionState.PORT_CONFLICT
                        logger.warning("UDP port %d is in use (Port Conflict). Another application (like Pits n' Giggles) might be running. Retrying in 5s...", self.port)
                        await asyncio.sleep(5)
                    else:
                        self.state = ConnectionState.FAILED
                        logger.warning("Could not bind UDP port %d: %s. Retrying in 2s...", self.port, e)
                        await asyncio.sleep(2)
                    continue
            await asyncio.sleep(1)

    async def disconnect(self) -> None:
        self.state = ConnectionState.STOPPING
        if self._connection_task is not None:
            self._connection_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._connection_task
            self._connection_task = None

        if self._transport is not None:
            self._transport.close()
            self._transport = None
            
        self.state = ConnectionState.DISCONNECTED
        logger.info("UDPProvider disconnected")

    def _on_packet(self, data: bytes) -> None:
        try:
            self._packet_queue.put_nowait(data)
        except asyncio.QueueFull:
            logger.warning("UDP packet queue full, dropping packet")

    async def run(self) -> None:
        while self._running:
            raw = await self._packet_queue.get()
            message = self.router.route(self.game, raw)
            if message is not None:
                await self._publish(message)
