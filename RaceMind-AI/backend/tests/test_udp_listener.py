"""Real socket-level tests for UDPProvider: binding, port-conflict
detection, and end-to-end packet delivery.

For "a parser raising an arbitrary exception can't kill the receive
loop," see test_packet_router.py's ExplodingParser test - that's the
precise, deterministic version of that guarantee. The malformed-packet
test here is about realistic noise (too-short/garbage UDP datagrams,
the kind that's easy to actually receive on a shared port) rather than
adversarially triggering an exception, since the current parsers'
length checks already reject those before ever reaching struct.unpack.
"""

from __future__ import annotations

import asyncio
import contextlib
import socket
from collections.abc import AsyncIterator

from telemetry.models import GameTitle, TelemetryFrame
from telemetry.udp_listener import ConnectionState, UDPProvider
from tests.f1_packet_builders import build_car_telemetry_packet


async def _wait_for_state(provider: UDPProvider, state: ConnectionState, timeout: float = 5.0) -> None:
    async def _poll() -> None:
        while provider.state != state:
            await asyncio.sleep(0.02)

    await asyncio.wait_for(_poll(), timeout=timeout)


@contextlib.asynccontextmanager
async def _running_provider(port: int, **kwargs) -> AsyncIterator[UDPProvider]:
    provider = UDPProvider(host="127.0.0.1", port=port, **kwargs)
    task = asyncio.create_task(provider.start())
    try:
        await _wait_for_state(provider, ConnectionState.CONNECTED)
        yield provider
    finally:
        await provider.stop()
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


def _send_udp(port: int, payload: bytes) -> None:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.sendto(payload, ("127.0.0.1", port))
    finally:
        sock.close()


async def test_udp_provider_binds_and_becomes_connected():
    async with _running_provider(28001) as provider:
        assert provider.state == ConnectionState.CONNECTED


async def test_second_provider_on_same_port_detects_conflict():
    async with _running_provider(28002) as first:
        assert first.state == ConnectionState.CONNECTED

        second = UDPProvider(host="127.0.0.1", port=28002)
        task = asyncio.create_task(second.start())
        try:
            await _wait_for_state(second, ConnectionState.PORT_CONFLICT)
            assert second.state == ConnectionState.PORT_CONFLICT
        finally:
            await second.stop()
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task


async def test_malformed_packets_do_not_prevent_subsequent_valid_delivery():
    """Real garbage over a real socket, immediately followed by a real
    valid packet - confirms the valid one still arrives as a decoded
    TelemetryFrame rather than the loop having wedged or died."""
    async with _running_provider(28003, game=GameTitle.F1_25) as provider:
        queue = provider.subscribe()

        _send_udp(28003, b"\x00\x01garbage")
        _send_udp(28003, b"not even close to a real packet, just noise on the wire")

        valid_packet = build_car_telemetry_packet(packet_format=2025, speed=277, gear=4, engine_rpm=10500)
        _send_udp(28003, valid_packet)

        frame = await asyncio.wait_for(queue.get(), timeout=5.0)

        assert isinstance(frame, TelemetryFrame)
        assert frame.speed_kph == 277
        assert frame.gear == 4


async def test_publish_isolates_one_stalled_subscriber_from_others():
    """The property that makes 'Railway down never blocks local
    telemetry' safe: each subscriber has its own independent,
    non-blocking queue (TelemetryProvider._publish). A subscriber that
    never reads (simulating a stuck/unreachable cloud uplink) must not
    stop another subscriber (simulating the local dashboard broadcast)
    from receiving."""
    async with _running_provider(28004) as provider:
        stalled = provider.subscribe()  # never read from below
        healthy = provider.subscribe()

        packet = build_car_telemetry_packet(packet_format=2025, speed=199)
        _send_udp(28004, packet)

        frame = await asyncio.wait_for(healthy.get(), timeout=5.0)
        assert frame.speed_kph == 199
        # If publishing to `stalled` had blocked the loop, the line
        # above would have timed out instead of succeeding.
        assert not stalled.empty()
