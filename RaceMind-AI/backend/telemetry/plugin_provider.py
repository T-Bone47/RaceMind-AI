"""Placeholder for future sim support beyond the F1 UDP protocol
(Assetto Corsa shared memory, ACC, iRacing SDK, Le Mans Ultimate,
rFactor 2 plugin). `GameAdapter` is the contract a future adapter
implements; `PluginProvider` bridges it into the standard
TelemetryProvider interface everything else already depends on.
"""

from __future__ import annotations

from typing import Protocol

from telemetry.provider import TelemetryProvider


class GameAdapter(Protocol):
    name: str

    async def open(self) -> None: ...
    async def close(self) -> None: ...


class PluginProvider(TelemetryProvider):
    def __init__(self, adapter: GameAdapter) -> None:
        super().__init__()
        self.adapter = adapter

    async def connect(self) -> None:
        await self.adapter.open()

    async def disconnect(self) -> None:
        await self.adapter.close()

    async def run(self) -> None:
        raise NotImplementedError(
            f"PluginProvider adapter '{self.adapter.name}' doesn't translate frames yet - "
            "placeholder for future sim support."
        )
