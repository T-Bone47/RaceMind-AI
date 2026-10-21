"""Live UDP telemetry listener.

Owns the socket and the receive loop - that part is fully real and
testable today. Decoding is delegated entirely to `PacketRouter`, which
auto-detects the game format per packet (see `PacketRouter.route_auto`)
and in turn delegates to a per-game-year parser (see
telemetry/parsers/). Game years without a real parser yet just return
None rather than raising, so the loop keeps running either way.
"""

from __future__ import annotations

import asyncio
import contextlib
import enum
import logging
import time
from collections.abc import Callable

from telemetry.models import GameTitle
from telemetry.packet_router import PacketRouter
from telemetry.parsers import register_all as register_all_parsers
from telemetry.provider import TelemetryProvider

logger = logging.getLogger(__name__)

_PACKET_QUEUE_SIZE = 5000
_QUEUE_POLL_TIMEOUT = 1.0  # seconds; bounds how long run() can block after `stop()` is called
_STATUS_LOG_INTERVAL = 3.0  # seconds between "[TELEMETRY] F1 telemetry active" rate logs


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
        self.game = game  # fallback only - route_auto() detects the real format from each packet's header
        self.router = router or _default_router()
        self.state = ConnectionState.DISCONNECTED
        self._transport: asyncio.DatagramTransport | None = None
        self._connection_task: asyncio.Task[None] | None = None
        self._status_log_task: asyncio.Task[None] | None = None
        self._packet_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=_PACKET_QUEUE_SIZE)
        self._packets_since_log = 0
        self.last_packet_at: float | None = None

    async def connect(self) -> None:
        """Start the background maintenance loop to bind the UDP port.
        Idempotent; safe to call multiple times.
        """
        if self.state in (ConnectionState.CONNECTING, ConnectionState.CONNECTED):
            return

        self.state = ConnectionState.CONNECTING
        logger.info("[TELEMETRY] UDP listener starting on %s:%d", self.host, self.port)
        self._connection_task = asyncio.create_task(self._maintain_connection())
        if self._status_log_task is None:
            self._status_log_task = asyncio.create_task(self._log_status_periodically())

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
                    logger.info("[TELEMETRY] UDP listener ready (%s:%d)", self.host, self.port)
                except OSError as e:
                    # 10048 is WSAEADDRINUSE (Address already in use) on Windows
                    # 98 is EADDRINUSE on Linux
                    if getattr(e, "winerror", None) == 10048 or getattr(e, "errno", None) in (98, 48):
                        self.state = ConnectionState.PORT_CONFLICT
                        logger.warning(
                            "[TELEMETRY] UDP %d unavailable: address already in use "
                            "(another RaceMind instance, or an app like Pits n' Giggles, may "
                            "already be listening). Retrying in 5s...",
                            self.port,
                        )
                        await asyncio.sleep(5)
                    else:
                        self.state = ConnectionState.FAILED
                        logger.warning("[TELEMETRY] UDP %d unavailable: %s. Retrying in 2s...", self.port, e)
                        await asyncio.sleep(2)
                    continue
            await asyncio.sleep(1)

    async def disconnect(self) -> None:
        self.state = ConnectionState.STOPPING
        if self._status_log_task is not None:
            self._status_log_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._status_log_task
            self._status_log_task = None

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
        self._packets_since_log += 1
        self.last_packet_at = time.monotonic()
        try:
            self._packet_queue.put_nowait(data)
        except asyncio.QueueFull:
            logger.warning("[TELEMETRY] UDP packet queue full, dropping packet")

    async def _log_status_periodically(self) -> None:
        """Every _STATUS_LOG_INTERVAL seconds, log a packet rate - but
        only while packets are actually arriving, so this stays quiet
        (rather than spamming '0.0/s') whenever the game isn't running
        or telemetry is paused."""
        while True:
            await asyncio.sleep(_STATUS_LOG_INTERVAL)
            count, self._packets_since_log = self._packets_since_log, 0
            if count == 0:
                continue
            rate = count / _STATUS_LOG_INTERVAL
            detected = self.router.last_detected_game
            game_name = detected.name if detected is not None else self.game.name
            logger.info("[TELEMETRY] F1 telemetry active | game=%s | packet_rate=%.1f/s", game_name, rate)

    async def run(self) -> None:
        while self._running:
            try:
                raw = await asyncio.wait_for(self._packet_queue.get(), timeout=_QUEUE_POLL_TIMEOUT)
            except TimeoutError:
                # No packet in this window - loop back around so `stop()`
                # (which flips self._running) takes effect promptly even
                # while idle, instead of blocking forever on an empty queue.
                continue
            try:
                message = self.router.route_auto(raw, fallback=self.game)
                if message is not None:
                    await self._publish(message)
            except Exception:  # noqa: BLE001 - one bad packet or a downstream subscriber issue must never kill the receive loop
                logger.exception("[TELEMETRY] Unexpected error handling a telemetry packet")
