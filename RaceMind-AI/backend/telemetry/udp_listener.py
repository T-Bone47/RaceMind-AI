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
import logging
from collections.abc import Callable

from telemetry.models import GameTitle
from telemetry.packet_router import PacketRouter
from telemetry.parsers import register_all as register_all_parsers
from telemetry.provider import TelemetryProvider

logger = logging.getLogger(__name__)

_PACKET_QUEUE_SIZE = 5000


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
    """Receives live UDP telemetry broadcast by a running game session."""

    def __init__(
        self,
        host: str = "0.0.0.0",
        port: int = 20777,
        game: GameTitle = GameTitle.F1_26,
        router: PacketRouter | None = None,
    ) -> None:
        super().__init__()
        self.host = host
        self.port = port
        self.game = game
        self.router = router or _default_router()
        self._transport: asyncio.DatagramTransport | None = None
        self._packet_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=_PACKET_QUEUE_SIZE)

    async def connect(self) -> None:
        loop = asyncio.get_running_loop()
        self._transport, _ = await loop.create_datagram_endpoint(
            lambda: _TelemetryDatagramProtocol(self._on_packet),
            local_addr=(self.host, self.port),
        )
        logger.info("UDPProvider listening on %s:%d for %s", self.host, self.port, self.game.value)

    async def disconnect(self) -> None:
        if self._transport is not None:
            self._transport.close()
            self._transport = None

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
