"""Manual/dev tool: sends spec-shaped synthetic F1 telemetry over UDP to
127.0.0.1:20777, for testing RaceMind's receive pipeline without a
real game running. Never used in production - see docs/TELEMETRY_SETUP.md
for the difference between this and a real game session.

Usage:
    python send_udp.py [speed] [throttle] [gear] [--format 2025|2026]
"""

import argparse
import socket
import time

from tests.f1_packet_builders import build_car_telemetry_packet, build_lap_data_packet


def send_packet(speed: int, throttle: int, gear: int, packet_format: int, count: int = 50):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    # LapData first so the CarTelemetry frames come out enriched with
    # lap_number/lap_distance_m, matching how a real session behaves.
    lap_packet = build_lap_data_packet(packet_format=packet_format, lap_number=1, lap_distance_m=0.0)
    sock.sendto(lap_packet, ("127.0.0.1", 20777))

    telemetry_packet = build_car_telemetry_packet(
        packet_format=packet_format,
        player_car_index=0,
        speed=speed,
        throttle=throttle / 100.0,
        steer=0.0,
        brake=0.0,
        gear=gear,
        engine_rpm=11000,
        drs=0,
    )
    for _ in range(count):
        sock.sendto(telemetry_packet, ("127.0.0.1", 20777))
        time.sleep(1 / 60)  # ~60Hz, matching a typical in-game UDP send rate

    print(
        f"Sent {count} CarTelemetry packets (packet_format={packet_format}): "
        f"speed={speed}, throttle={throttle}, gear={gear}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("speed", type=int, nargs="?", default=280)
    parser.add_argument("throttle", type=int, nargs="?", default=85)
    parser.add_argument("gear", type=int, nargs="?", default=7)
    parser.add_argument(
        "--format",
        type=int,
        choices=(2025, 2026),
        default=2025,
        help="packet_format to send (2025 = F1 25 base game, 2026 = 2026 Season Pack DLC). "
        "RaceMind auto-detects this from the packet itself - this flag is only about which "
        "synthetic packet shape send_udp.py builds.",
    )
    args = parser.parse_args()
    send_packet(args.speed, args.throttle, args.gear, args.format)
