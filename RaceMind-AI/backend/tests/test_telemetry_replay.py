from __future__ import annotations

import asyncio
from pathlib import Path

import pytest

from telemetry.models import TelemetryFrame
from telemetry.replay import ReplayProvider


async def test_replay_provider_streams_frames_in_order(tmp_path: Path):
    frames = [
        TelemetryFrame(
            speed_kph=200 + i, throttle_pct=90, brake_pct=0, steering=0.0, gear=6, engine_rpm=11000
        )
        for i in range(3)
    ]
    replay_file = tmp_path / "session.jsonl"
    with replay_file.open("w") as fh:
        for frame in frames:
            fh.write(frame.model_dump_json() + "\n")

    provider = ReplayProvider(replay_file, speed_multiplier=1000.0)
    queue = provider.subscribe()

    await asyncio.wait_for(provider.start(), timeout=5)  # completes on its own since loop=False

    received = [queue.get_nowait() for _ in range(3)]
    for message in received:
        assert isinstance(message, TelemetryFrame)
    assert [m.speed_kph for m in received if isinstance(m, TelemetryFrame)] == [200, 201, 202]


async def test_replay_provider_missing_file_raises(tmp_path: Path):
    provider = ReplayProvider(tmp_path / "does_not_exist.jsonl")
    with pytest.raises(FileNotFoundError):
        await provider.connect()


async def test_recorder_and_replay_round_trip(tmp_path: Path):
    """recorder.py writes what replay.py reads back, end to end."""
    from telemetry.recorder import TelemetryRecorder

    source = ReplayProvider(_write_fixture(tmp_path / "source.jsonl", count=2), speed_multiplier=1000.0)
    recording_path = tmp_path / "recorded.jsonl"
    recorder = TelemetryRecorder(source, recording_path)

    await recorder.start()
    await source.start()
    await recorder.stop()

    assert recording_path.exists()
    assert len(recording_path.read_text().strip().splitlines()) == 2


def _write_fixture(path: Path, count: int) -> Path:
    with path.open("w") as fh:
        for i in range(count):
            frame = TelemetryFrame(
                speed_kph=150 + i, throttle_pct=50, brake_pct=0, steering=0.0, gear=4, engine_rpm=9000
            )
            fh.write(frame.model_dump_json() + "\n")
    return path
