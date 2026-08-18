"""Tests for the F1 2025 UDP parser."""
import pytest

from telemetry.parsers.f1_2025 import F12025Parser


def test_f1_2025_parser_raises_not_implemented():
    parser = F12025Parser()
    with pytest.raises(NotImplementedError):
        parser.decode_packet(b"fake_packet_data")
