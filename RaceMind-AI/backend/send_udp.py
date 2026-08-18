import socket
import sys
import time

from tests.test_f1_2024_parser import _build_car_telemetry_packet


def send_packet(speed, throttle, gear, count=5):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    packet = _build_car_telemetry_packet(
        player_car_index=0,
        target_car_data=dict(
            speed=speed,
            throttle=throttle / 100.0,
            steer=0.0,
            brake=0.0,
            gear=gear,
            engine_rpm=11000,
            drs=0,
        )
    )
    for i in range(count):
        sock.sendto(packet, ("127.0.0.1", 20777))
        time.sleep(0.1)
    print(f"Sent {count} packets: speed={speed}, throttle={throttle}, gear={gear}")

if __name__ == "__main__":
    speed = int(sys.argv[1]) if len(sys.argv) > 1 else 280
    throttle = int(sys.argv[2]) if len(sys.argv) > 2 else 85
    gear = int(sys.argv[3]) if len(sys.argv) > 3 else 7
    send_packet(speed, throttle, gear)
