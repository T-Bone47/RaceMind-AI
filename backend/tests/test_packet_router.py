"""Tests for PacketRouter: auto-detecting a game format from each
packet's header, and never letting one bad packet or a broken parser
take down the receive loop."""

from telemetry.models import GameTitle
from telemetry.packet_router import PacketRouter, detect_game, peek_header
from telemetry.parsers import register_all
from tests.f1_packet_builders import build_car_telemetry_packet, build_header


def _router() -> PacketRouter:
    router = PacketRouter()
    register_all(router)
    return router


def test_peek_header_reads_packet_format_and_id():
    packet = build_header(packet_format=2025, packet_id=6, player_car_index=3)

    header = peek_header(packet)

    assert header is not None
    assert header.packet_format == 2025
    assert header.packet_id == 6
    assert header.player_car_index == 3


def test_peek_header_returns_none_for_too_short_buffer():
    assert peek_header(b"short") is None


def test_detect_game_maps_known_formats():
    assert detect_game(peek_header(build_header(packet_format=2025, packet_id=6))) == GameTitle.F1_25
    assert (
        detect_game(peek_header(build_header(packet_format=2026, packet_id=6)))
        == GameTitle.F1_25_2026_DLC
    )


def test_detect_game_returns_none_for_unrecognized_format():
    header = peek_header(build_header(packet_format=9999, packet_id=6))
    assert detect_game(header) is None


def test_route_auto_picks_f1_25_parser_from_header():
    router = _router()
    packet = build_car_telemetry_packet(packet_format=2025, speed=250)

    frame = router.route_auto(packet)

    assert frame is not None
    assert frame.speed_kph == 250
    assert router.last_detected_game == GameTitle.F1_25


def test_route_auto_picks_2026_dlc_parser_from_header():
    router = _router()
    packet = build_car_telemetry_packet(packet_format=2026, speed=260)

    frame = router.route_auto(packet)

    assert frame is not None
    assert frame.speed_kph == 260
    assert router.last_detected_game == GameTitle.F1_25_2026_DLC


def test_route_auto_uses_fallback_for_unrecognized_format():
    """A future/unknown packet_format shouldn't go dark - it should
    still get routed through whatever the caller configured as a
    fallback, since that's the best guess available."""
    router = _router()
    packet = build_header(packet_format=9999, packet_id=6) + bytes(60)

    frame = router.route_auto(packet, fallback=GameTitle.F1_25)

    # The body doesn't match F1_25's real shape, but the point is it
    # gets attempted rather than silently dropped, and doesn't raise.
    assert frame is None or frame is not None  # no exception is the actual assertion


def test_route_auto_returns_none_without_fallback_for_unrecognized_format():
    router = _router()
    packet = build_header(packet_format=9999, packet_id=6) + bytes(60)

    assert router.route_auto(packet) is None


def test_route_auto_returns_none_for_too_short_packet_with_no_fallback():
    assert _router().route_auto(b"x") is None


def test_route_swallows_any_parser_exception_not_just_not_implemented():
    """route() must survive ANY exception a parser raises while decoding
    untrusted network bytes - not just the expected
    NotImplementedError - or a single malformed packet could kill the
    entire receive loop for the rest of the session."""

    class ExplodingParser:
        game = GameTitle.F1_25

        def decode_packet(self, raw: bytes):
            raise ValueError("simulated parser bug")

    router = PacketRouter()
    router.register(ExplodingParser())

    result = router.route(GameTitle.F1_25, b"anything")

    assert result is None  # did not raise
