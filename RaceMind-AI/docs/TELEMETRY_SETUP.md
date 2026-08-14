# Connecting a Live Game Session

RaceMind AI listens for UDP telemetry broadcast by the F1 game (`telemetry/udp_listener.py`).
Real parsing is implemented for **F1 24** today (see `telemetry/parsers/f1_2024.py`); every
other supported year is wired up architecturally but not decoding packet bodies yet - see
`backend/README.md`'s "What's architecture-only right now" section.

## In-game UDP settings

Every F1 game (23-26) exposes this in the same place: **Options → Settings → UDP Telemetry
Settings** (bottom of the Settings menu). You need:

| Setting | Value |
|---|---|
| UDP Telemetry | On |
| UDP Broadcast Mode | On *(see "Same PC vs. console" below for when to use this)* |
| UDP IP Address | The IP of the machine running RaceMind AI's backend (only used when Broadcast Mode is Off) |
| UDP Port | `20777` (RaceMind AI's default - configurable via `UDP_DEFAULT_PORT` in `backend/.env`) |
| UDP Send Rate | 20-60Hz; higher = smoother telemetry, more bandwidth/CPU |
| UDP Format | Match your game version (e.g. "2024" for F1 24) |

## Same PC (PC gaming)

If the game and RaceMind AI's backend run on the same machine, leave **Broadcast Mode off**
and set **UDP IP Address** to `127.0.0.1`. Start the backend before starting `UDPProvider`
(it binds `0.0.0.0:20777` by default, which also accepts `127.0.0.1` traffic):

```bash
cd backend
python3 -c "
import asyncio
from telemetry.udp_listener import UDPProvider

async def main():
    provider = UDPProvider(host='0.0.0.0', port=20777)
    await provider.start()

asyncio.run(main())
"
```

## Xbox / PlayStation (or PC on a different machine)

Consoles can't run RaceMind AI locally, so telemetry has to cross the network to whichever
machine does. Two ways to do that:

**Broadcast mode (simpler)** - turn on **UDP Broadcast Mode** in the console's UDP settings.
This sends telemetry to every device on the local subnet listening on the configured port, so
you don't need to know or set an IP address on the console side at all.

**Direct IP (more reliable on flaky WiFi/some routers)** - turn Broadcast Mode **off** and set
**UDP IP Address** on the console to the LAN IP of the PC running RaceMind AI (e.g.
`192.168.1.42` - find it with `ipconfig` on Windows or `ip addr` on Linux/macOS).

Either way:

- **Console and PC must be on the same local network** - same router, same subnet. A console
  on WiFi and a PC on Ethernet through the same router is fine; different networks (e.g. a
  phone hotspot vs. home WiFi) is not.
- **Bind the listener to `0.0.0.0`, not `127.0.0.1`** - `UDPProvider`'s default already does
  this, since `127.0.0.1` only accepts traffic from the same machine and would silently drop
  everything from a console.
- **Firewall**: allow inbound UDP on port 20777 for the process running RaceMind AI's backend.
  On Windows, this is a Windows Defender Firewall inbound rule; most other firewalls block
  incoming UDP by default even on a trusted LAN.
- Note the same "Restricted" vs. "Public" **Your Telemetry** setting applies regardless of
  platform - see `backend/README.md` for what's zeroed out under "Restricted" (fuel, ERS, and
  most damage fields for cars other than your own; irrelevant for a single-player session).

## Verifying it's actually receiving something

Before trusting the dashboard, confirm packets are arriving at the transport layer:

```bash
# From the machine running RaceMind AI's backend, while the game is running a session:
python3 -c "
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', 20777))
print('Listening on :20777 - waiting for a packet...')
data, addr = sock.recvfrom(2048)
print(f'Got {len(data)} bytes from {addr}')
"
```

If nothing arrives within a few seconds of driving in-session, the problem is almost always
network reachability (same subnet? firewall? right IP?), not RaceMind AI - the two settings to
double check first are Broadcast Mode and the firewall inbound rule above.
