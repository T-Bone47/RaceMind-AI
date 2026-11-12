"""Produce research-only Suzuka Q1 brake activation summaries from a private OpenF1 cache."""

import argparse
import bisect
import json
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from statistics import median

from fetch_openf1_pilot import SESSIONS


ROOT = Path(__file__).resolve().parents[1]
MAX_GAP = 0.60
MIN_COVERAGE = 0.97
MIN_RATE = 3.0
LAP_CLOSURE_S = 0.45
TIMING_TOLERANCE_S = 0.003
EPSILON = 0.000001
SOURCE_URL = "https://openf1.org/docs/"
DELETED = re.compile(r"CAR\s+(\d+).*?LAP\s+(\d+)\s+\d{2}:\d{2}", re.IGNORECASE)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def timestamp(raw):
    return datetime.fromisoformat(raw).timestamp()


def indexed(rows):
    result = defaultdict(list)
    for row in rows:
        result[row["driver_number"]].append(row)
    return result


def load_source(cache, session, meeting, endpoint, driver=None):
    suffix = "" if driver is None else f"_{driver}"
    path = cache / f"{session}_{endpoint}{suffix}.json"
    records = read_json(path)
    for row in records:
        if row["session_key"] != session or row["meeting_key"] != meeting:
            raise ValueError(f"Mismatched session in {path.name}")
        if driver is not None and row["driver_number"] != driver:
            raise ValueError(f"Mismatched driver in {path.name}")
    return records


def qualifying_window(control):
    q1 = [row for row in control if row["qualifying_phase"] == 1]
    q2 = [row for row in control if row["qualifying_phase"] == 2]
    if any(row["flag"] in {"YELLOW", "DOUBLE YELLOW", "RED"} for row in q1):
        raise ValueError("Q1 caution chronology requires manual review")
    start = min(timestamp(row["date"]) for row in q1 if row["flag"] == "GREEN")
    checkered = min(timestamp(row["date"]) for row in q1 if row["flag"] == "CHEQUERED")
    next_start = min(timestamp(row["date"]) for row in q2 if row["flag"] == "GREEN")
    if not start < checkered < next_start:
        raise ValueError("Invalid qualifying phase chronology")
    return start, checkered, next_start


def deleted_laps(control):
    invalid = set()
    for row in sorted(control, key=lambda row: timestamp(row["date"])):
        message = row["message"].upper()
        if "LAP DELETED" not in message and "LAP REINSTATED" not in message:
            continue
        match = DELETED.search(message)
        if match is None:
            raise ValueError("Unrecognized lap deletion/reinstatement message")
        key = tuple(int(value) for value in match.groups())
        if "LAP DELETED" in message:
            invalid.add(key)
        else:
            invalid.discard(key)
    return invalid


def dry_in_window(weather, start, end):
    earlier = [row for row in weather if row[0] <= start]
    later = [row for row in weather if row[0] >= end]
    if not earlier or not later:
        return False
    samples = [earlier[-1], *(row for row in weather if start < row[0] < end), later[0]]
    return all(row[1] == 0 for row in samples) and all(b[0] - a[0] <= 90 for a, b in zip(samples, samples[1:]))


def push_laps(number, laps, stints, result, q1, invalid, weather, stats):
    durations = result.get("duration") if result else None
    best = durations[0] if isinstance(durations, list) and durations else None
    if not best or result["dns"] or result["dsq"]:
        stats["drivers_without_published_q1"] += 1
        return []
    by_number = {row["lap_number"]: row for row in laps}
    if len(by_number) != len(laps):
        raise ValueError(f"Duplicate lap numbers for driver {number}")
    candidates = []
    for row in sorted(laps, key=lambda row: row["lap_number"]):
        if not row["date_start"] or not row["lap_duration"] or row["is_pit_out_lap"]:
            continue
        lap = row["lap_number"]
        start = timestamp(row["date_start"])
        duration = row["lap_duration"]
        end = start + duration
        if not q1[0] <= start <= q1[1] or end >= q1[2]:
            continue
        if (number, lap) in invalid:
            stats["lap_deleted"] += 1
            continue
        if duration < best - TIMING_TOLERANCE_S or duration > best * 1.03:
            stats["lap_outside_push_band"] += 1
            continue
        sectors = [row[f"duration_sector_{sector}"] for sector in (1, 2, 3)]
        if any(value is None or value <= 0 for value in sectors) or abs(sum(sectors) - duration) > 0.01:
            stats["lap_sector_duration_mismatch"] += 1
            continue
        segments = [row[f"segments_sector_{sector}"] for sector in (1, 2, 3)]
        if any(not segment or 2064 in segment for segment in segments):
            stats["lap_pit_or_missing_segments"] += 1
            continue
        matching_stints = [item for item in stints if item["lap_start"] <= lap <= item["lap_end"]]
        if len(matching_stints) != 1 or matching_stints[0]["compound"] != "SOFT":
            stats["lap_tyre_compound_unknown_or_not_soft"] += 1
            continue
        if not dry_in_window(weather, start, end):
            stats["lap_rain_or_weather_unverified"] += 1
            continue
        next_lap = by_number.get(lap + 1)
        if not next_lap or not next_lap["date_start"] or abs(timestamp(next_lap["date_start"]) - end) > LAP_CLOSURE_S:
            stats["lap_timestamp_closure_failed"] += 1
            continue
        candidates.append((lap, start, start + sectors[0], start + sectors[0] + sectors[1], end))
    matched = [lap for lap, *_ in candidates if abs(by_number[lap]["lap_duration"] - best) <= TIMING_TOLERANCE_S]
    if not matched:
        stats["drivers_without_validated_q1_best"] += 1
        return []
    stats["eligible_push_laps_before_car_quality"] += len(candidates)
    return candidates


def canonical_samples(rows):
    samples = {}
    invalid_codes = Counter()
    duplicates = 0
    for row in rows:
        time = timestamp(row["date"])
        code = row.get("brake")
        if type(code) is int and code in (0, 100):
            state = code == 100
        else:
            state = None
            invalid_codes[str(code)] += 1
        if time in samples:
            duplicates += 1
            if samples[time] != state:
                samples[time] = None
        else:
            samples[time] = state
    times = sorted(samples)
    return times, [samples[time] for time in times], invalid_codes, duplicates


def activation_fraction(times, states, start, end):
    first = max(0, bisect.bisect_right(times, start) - 1)
    stop = min(len(times) - 1, bisect.bisect_left(times, end))
    supported, on, lower, upper = 0.0, 0.0, 0.0, 0.0
    spacings = []
    for index in range(first, stop):
        a, b = times[index], times[index + 1]
        left, right = max(start, a), min(end, b)
        duration = right - left
        before, after = states[index], states[index + 1]
        if duration <= 0 or b - a > MAX_GAP + EPSILON or before is None or after is None:
            continue
        supported += duration
        spacings.append(b - a)
        if before == after:
            if before:
                on += duration
                lower += duration
                upper += duration
            continue
        midpoint = (a + b) / 2
        on += max(0.0, min(right, midpoint) - left) if before else max(0.0, right - max(left, midpoint))
        upper += duration
    width = end - start
    coverage = supported / width
    rate = 1 / median(spacings) if spacings else 0
    if coverage < MIN_COVERAGE:
        return None, "window_low_bracket_coverage"
    if rate < MIN_RATE:
        return None, "window_low_sample_rate"
    return {
        "value": on / supported,
        "lower": lower / width,
        "upper": min(1.0, (upper + width - supported) / width),
        "coverage": coverage,
        "median_native_hz": rate,
    }, None


def aggregate(observations, driver, year, session, meeting, sector):
    lap_numbers = [lap for lap, _ in observations]
    values = [item for _, item in observations]
    point = median(item["value"] for item in values)
    return {
        "driver_id": driver["id"],
        "feature_id": "brake_activation_fraction",
        "value": round(point, 5),
        "unit": "fraction",
        "season": year,
        "team": driver["team_name"],
        "circuit_id": "suzuka",
        "layout_id": "suzuka-2",
        "session_type": "qualifying",
        "qualifying_segment": "Q1",
        "sector": sector,
        "corner_class": None,
        "session_key": session,
        "meeting_key": meeting,
        "driver_number": driver["driver_number"],
        "sample_count": len(values),
        "session_count": 1,
        "confidence": 0.45 if len(values) >= 2 else 0.30,
        "confidence_basis": "Uncalibrated context-specific observation strength; one session per row",
        "source_ids": ["OPENF1_DOCS"],
        "source_url": SOURCE_URL,
        "benchmark_eligible": False,
        "usage": "research_only",
        "evidence_type": "empirical_binary_state",
        "method": "Median over passing dry SOFT Q1 push laps of midpoint-assigned binary brake-active duration / observed duration",
        "limitations": "One session, approximate sector alignment, conditional on eligible samples. No brake pressure, style attribution, matched game cohort or commercial permission.",
        "qa": {
            "lap_numbers": lap_numbers,
            "min_window_coverage": round(min(item["coverage"] for item in values), 5),
            "min_window_median_native_hz": round(min(item["median_native_hz"] for item in values), 3),
            "conditional_window_bound_low": round(median(item["lower"] for item in values), 5),
            "conditional_window_bound_high": round(median(item["upper"] for item in values), 5),
            "mad_between_laps": round(median(abs(item["value"] - point) for item in values), 5) if len(values) >= 2 else None,
        },
    }


def process_session(cache, year, session, meeting, roster):
    metadata = load_source(cache, session, meeting, "sessions")
    if len(metadata) != 1 or metadata[0]["year"] != year or metadata[0]["circuit_short_name"] != "Suzuka" or metadata[0]["session_name"] != "Qualifying":
        raise ValueError(f"Unexpected qualifying session identity for {year}")
    control = load_source(cache, session, meeting, "race_control")
    q1 = qualifying_window(control)
    invalid = deleted_laps(control)
    weather = sorted((timestamp(row["date"]), row["rainfall"]) for row in load_source(cache, session, meeting, "weather"))
    laps = indexed(load_source(cache, session, meeting, "laps"))
    stints = indexed(load_source(cache, session, meeting, "stints"))
    results = {row["driver_number"]: row for row in load_source(cache, session, meeting, "session_result")}
    drivers = load_source(cache, session, meeting, "drivers")
    all_rows = []
    stats = Counter(drivers_in_session=len(drivers))
    invalid_codes = Counter()
    for driver in drivers:
        number = driver["driver_number"]
        identity = roster[driver["name_acronym"]]
        if str(year) not in identity["seasons"]:
            raise ValueError(f"Driver abbreviation {driver['name_acronym']} did not start in {year}")
        candidates = push_laps(number, laps[number], stints[number], results.get(number), q1, invalid, weather, stats)
        if not candidates:
            continue
        try:
            raw = load_source(cache, session, meeting, "car_data", number)
        except FileNotFoundError:
            stats["drivers_missing_car_data"] += 1
            continue
        times, states, codes, duplicates = canonical_samples(raw)
        invalid_codes.update(codes)
        stats["duplicate_car_timestamps"] += duplicates
        windows = defaultdict(list)
        for lap, start, s1, s2, end in candidates:
            if not start < s1 < s2 < end:
                raise ValueError(f"Unexpected sector timing order for {driver['name_acronym']}")
            first = bisect.bisect_left(times, start)
            last = bisect.bisect_left(times, end)
            stats["invalid_brake_samples_in_candidate_laps"] += states[first:last].count(None)
            for sector, a, b in ((None, start, end), (1, start, s1), (2, s1, s2), (3, s2, end)):
                value, failure = activation_fraction(times, states, a, b)
                if failure:
                    stats[failure] += 1
                else:
                    windows[sector].append((lap, value))
        if windows:
            stats["drivers_with_passing_window"] += 1
        stats["passing_whole_laps"] += len(windows.get(None, ()))
        for sector, observations in windows.items():
            all_rows.append(aggregate(observations, driver | {"id": identity["id"]}, year, session, meeting, sector))
    stats["aggregate_feature_rows"] = len(all_rows)
    return all_rows, dict(stats), dict(invalid_codes)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cache", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "research")
    args = parser.parse_args()
    roster = {row["abbreviation"]: row for row in read_json(ROOT / "research/roster.json") if row["priority"] == "A"}
    rows = []
    diagnostics = {}
    for year, (session, meeting) in SESSIONS.items():
        if not (args.cache / f"{session}_sessions.json").exists():
            diagnostics[year] = {"missing_session_cache": True}
            continue
        records, stats, codes = process_session(args.cache, year, session, meeting, roster)
        rows.extend(records)
        diagnostics[year] = {"session_key": session, "stats": stats, "invalid_brake_codes": codes}
    rows.sort(key=lambda row: (row["season"], row["driver_id"], row["sector"] or 0))
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "empirical_features.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(diagnostics, sort_keys=True, indent=2))


if __name__ == "__main__":
    main()
