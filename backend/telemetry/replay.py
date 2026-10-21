"""Replays a session recorded by `telemetry.recorder.TelemetryRecorder`.

Unlike UDPProvider, this one has no undocumented binary format to
reverse-engineer - it's replaying RaceMind AI's own normalized JSON
Lines format - so it's fully implemented, not architecture-only.
Useful for UI development, strategy-engine testing, and demos without a
game running.
"""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path

from telemetry.models import LeaderboardSnapshot, TelemetryEvent, TelemetryFrame, TelemetryMessage
from telemetry.provider import TelemetryProvider

logger = logging.getLogger(__name__)


class ReplayProvider(TelemetryProvider):
    def __init__(
        self, file_path: str | Path, speed_multiplier: float = 1.0, loop: bool = False
    ) -> None:
        super().__init__()
        self.file_path = Path(file_path)
        self.speed_multiplier = speed_multiplier
        self.loop = loop
        self._messages: list[TelemetryMessage] = []

    async def connect(self) -> None:
        if not self.file_path.exists():
            raise FileNotFoundError(f"Replay file not found: {self.file_path}")
        self._messages = list(self._load())
        logger.info("ReplayProvider loaded %d messages from %s", len(self._messages), self.file_path)

    def _load(self) -> list[TelemetryMessage]:
        messages: list[TelemetryMessage] = []
        with self.file_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                data = json.loads(line)
                message_type = data.get("type")
                if message_type == "event":
                    messages.append(TelemetryEvent.model_validate(data))
                elif message_type == "leaderboard":
                    messages.append(LeaderboardSnapshot.model_validate(data))
                else:
                    messages.append(TelemetryFrame.model_validate(data))
        return messages

    async def disconnect(self) -> None:
        self._messages = []

    async def run(self) -> None:
        while self._running:
            previous_ts = None
            for message in self._messages:
                if not self._running:
                    return
                if previous_ts is not None and self.speed_multiplier > 0:
                    delta = (message.timestamp - previous_ts).total_seconds()
                    await asyncio.sleep(max(delta, 0) / self.speed_multiplier)
                previous_ts = message.timestamp
                await self._publish(message)
            if not self.loop:
                return
