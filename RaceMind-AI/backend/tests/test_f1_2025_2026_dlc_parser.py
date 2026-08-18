"""Tests for the F1 2025 2026 DLC UDP parser."""
import pytest

from telemetry.parsers.f1_2025_2026_dlc import F120252026DLCParser


def test_f1_2025_2026_dlc_parser_raises_not_implemented():
    parser = F120252026DLCParser()
    with pytest.raises(NotImplementedError):
        parser.decode_packet(b"fake_packet_data")
