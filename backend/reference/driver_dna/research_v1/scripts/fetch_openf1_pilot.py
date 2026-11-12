#!/usr/bin/env python3
"""Download a bounded OpenF1 research pilot to a private cache outside the bundle."""
import argparse
import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SESSIONS = {2025: (10002, 1256), 2026: (11249, 1281)}
BASE = "https://api.openf1.org/v1/"

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cache", type=Path)
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    next_request = 0.0

    def get(endpoint, session, **params):
        nonlocal next_request
        url = BASE + endpoint + "?" + urllib.parse.urlencode({"session_key": session, **params})
        suffix = "_" + str(params["driver_number"]) if "driver_number" in params else ""
        path = args.cache / f"{session}_{endpoint}{suffix}.json"
        if path.is_file():
            return json.loads(path.read_text(encoding="utf-8"))
        for attempt in range(3):
            time.sleep(max(0, next_request - time.monotonic()))
            next_request = time.monotonic() + 2.2
            try:
                request = urllib.request.Request(url, headers={"User-Agent": "RaceMind-research-pilot/0.1"})
                with urllib.request.urlopen(request, timeout=25) as response:
                    data = json.load(response)
                if not isinstance(data, list):
                    raise ValueError(f"Unexpected payload from {url}")
                path.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
                print(path.name, len(data), flush=True)
                return data
            except urllib.error.HTTPError as error:
                if error.code == 429:
                    print(f"Rate limit returned for {url}. Resume after the published limit resets.", flush=True)
                    raise
                if error.code < 500 or attempt == 2:
                    raise
                next_request = max(next_request, time.monotonic() + 5 * (attempt + 1))

    for year, (session, meeting) in SESSIONS.items():
        session_info = get("sessions", session)
        if len(session_info) != 1 or session_info[0]["year"] != year or session_info[0]["meeting_key"] != meeting:
            raise ValueError(f"Unexpected session identity for {year}")
        for endpoint in ("laps", "stints", "weather", "race_control", "session_result"):
            get(endpoint, session)
        drivers = get("drivers", session)
        for number in sorted({record["driver_number"] for record in drivers}):
            get("car_data", session, driver_number=number)

if __name__ == "__main__":
    main()
