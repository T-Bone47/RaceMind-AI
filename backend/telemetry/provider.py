"""TelemetryProvider: the abstraction every telemetry source implements.

`UDPProvider` (live game), `ReplayProvider` (recorded session), and the
future `PluginProvider` (Assetto Corsa, ACC, iRacing, Le Mans Ultimate,
rFactor 2) all satisfy this contract, so the rest of the system depends
only on it and never on a specific transport or wire format.

Multiple consumers (the WebSocket broadcaster, the strategy engine, a
session recorder) can subscribe to the same provider simultaneously;
each gets its own queue so a slow consumer can't stall the others.
"""

from __future__ import annotations

import abc
import asyncio
import logging
from collections.abc import AsyncIterator

from telemetry.models import TelemetryMessage

logger = logging.getLogger(__name__)

_SUBSCRIBER_QUEUE_SIZE = 1000


class TelemetryProvider(abc.ABC):
    def __init__(self) -> None:
        self._subscribers: list[asyncio.Queue[TelemetryMessage]] = []
        self._running = False

    @abc.abstractmethod
    async def connect(self) -> None:
        """Open whatever resource this provider needs (socket, file handle, SDK session)."""

    @abc.abstractmethod
    async def disconnect(self) -> None:
        """Release the resource opened in `connect`."""

    @abc.abstractmethod
    async def run(self) -> None:
        """Main loop. Must call `self._publish(message)` for every frame/event
        produced, and return when `self._running` becomes False."""

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        await self.connect()
        try:
            await self.run()
        finally:
            self._running = False

    async def stop(self) -> None:
        self._running = False
        await self.disconnect()

    def subscribe(self) -> asyncio.Queue[TelemetryMessage]:
        queue: asyncio.Queue[TelemetryMessage] = asyncio.Queue(maxsize=_SUBSCRIBER_QUEUE_SIZE)
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[TelemetryMessage]) -> None:
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    async def stream(self) -> AsyncIterator[TelemetryMessage]:
        """Convenience async-iterator wrapper around subscribe/unsubscribe,
        for callers that want `async for message in provider.stream()`."""
        queue = self.subscribe()
        try:
            while True:
                yield await queue.get()
        finally:
            self.unsubscribe(queue)

    async def _publish(self, message: TelemetryMessage) -> None:
        for queue in list(self._subscribers):
            if queue.full():
                _ = queue.get_nowait()  # drop oldest under backpressure - live data beats stale data
                logger.warning("Subscriber queue full, dropped oldest telemetry message")
            await queue.put(message)
