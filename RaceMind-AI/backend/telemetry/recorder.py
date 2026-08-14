"""Records a live provider's output to disk, in the same JSON Lines
format `telemetry.replay.ReplayProvider` reads back. Fully implemented -
it's just serializing our own DTOs, no reverse-engineering involved.
"""

from __future__ import annotations

import asyncio
import contextlib
import logging
from pathlib import Path

from telemetry.models import TelemetryMessage
from telemetry.provider import TelemetryProvider

logger = logging.getLogger(__name__)


class TelemetryRecorder:
    def __init__(self, provider: TelemetryProvider, file_path: str | Path) -> None:
        self.provider = provider
        self.file_path = Path(file_path)
        self._task: asyncio.Task[None] | None = None
        self._queue: asyncio.Queue[TelemetryMessage] | None = None
        self._message_count = 0

    async def start(self) -> None:
        """Subscribes synchronously before returning - not deferred into
        the background task - so a caller doing
        `await recorder.start(); await provider.start()` can't race the
        provider into publishing before anyone's listening."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._queue = self.provider.subscribe()
        self._task = asyncio.create_task(self._record())

    async def stop(self) -> None:
        """Cancels the background task and waits for it to fully stop
        *before* touching the queue directly, then drains whatever it
        hadn't gotten to yet. That ordering - stop first, drain second -
        is what makes this deterministic regardless of exactly how far
        the background task had gotten when `stop()` was called; nothing
        here depends on event-loop scheduling order."""
        if self._task is not None:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._task
            self._task = None

        if self._queue is not None:
            with self.file_path.open("a", encoding="utf-8") as fh:
                while not self._queue.empty():
                    message = self._queue.get_nowait()
                    fh.write(message.model_dump_json() + "\n")
                    self._message_count += 1
            self.provider.unsubscribe(self._queue)
            self._queue = None

        logger.info("Recorded %d messages to %s", self._message_count, self.file_path)

    async def _record(self) -> None:
        assert self._queue is not None
        with self.file_path.open("a", encoding="utf-8") as fh:
            while True:
                message = await self._queue.get()
                fh.write(message.model_dump_json() + "\n")
                fh.flush()
                self._message_count += 1
