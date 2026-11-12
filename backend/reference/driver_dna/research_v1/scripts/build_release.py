#!/usr/bin/env python3
"""Build the release tables from checked research inputs."""
import csv
import hashlib
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research"
DATE = "2026-11-12"
VERSION = "1.0.0"
F1DB = "F1DB_2026_20_0"
TRAITS = (
    "preferred_balance", "observed_balance", "braking_style", "steering_style",
    "corner_entry_style", "mid_corner_style", "corner_exit_style", "throttle_style",
    "rotation_preference", "high_speed_style", "low_speed_style", "tyre_management_style",
    "wet_weather_style", "adaptability", "strengths", "limitations", "circuit_dependent_traits",
)
EXTRA_TRAITS = ("racecraft", "error_patterns")
EVIDENCE_COLUMNS = ("evidence_id", "driver_id", "trait_id", "claim", "evidence_category", "source_title",
                    "publisher", "author", "publication_date", "source_url", "season", "team", "circuit",
                    "direct_or_inferred", "limitations", "confidence", "researcher_notes", "source_id", "usage")
SOURCE_COLUMNS = ("source_id", "source_title", "publisher", "author", "source_url", "publication_date", "accessed_at",
                  "access_method", "data_license", "license_url", "attribution", "commercial_use", "limitations", "usage")
FEATURE_COLUMNS = ("driver_id", "feature_id", "season", "team", "circuit_id", "layout_id", "session_type",
                   "qualifying_segment", "sector", "context_id", "value", "unit", "measurement_available", "sample_count",
                   "session_count", "confidence", "source_ids", "source_url", "evidence_ids", "measurement_type",
                   "method", "benchmark_eligible", "usage", "missing_reason", "limitations", "qa")

def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def write_json(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")

def cell(value):
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if isinstance(value, bool):
        return str(value).lower()
    return value

def write_csv(name, columns, rows):
    with (ROOT / name).open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({column: cell(row.get(column)) for column in columns})

def source(identifier, title, publisher, url, access, licence, commercial, limitations, usage, licence_url=None, date=None):
    return dict(source_id=identifier, source_title=title, publisher=publisher, source_url=url,
                publication_date=date, accessed_at=DATE, access_method=access, data_license=licence,
                license_url=licence_url, attribution=publisher + ", " + title, commercial_use=commercial,
                limitations=limitations, usage=usage)

def additional_sources():
    open_docs = "https://openf1.org/docs/"
    open_terms = "https://openf1.org/#faq"
    f1_terms = "https://www.formula1.com/en/information/guidelines.4EOKE9RRqevL4niTK9kWyt"
    ea_spec = "https://forums.ea.com/blog/f1-games-game-info-hub-en/ea-sports%E2%84%A2-f1%C2%AE25-2026-season-pack-udp-specification/12187347"
    fia_terms = "https://www.fia.com/sites/default/files/termsandconditionsfiawebsite.pdf"
    return [
        source("OPENF1_DOCS", "OpenF1 public API documentation", "OpenF1", open_docs, "Public documentation", "Open source service; docs do not grant upstream data rights", "Use for documentation reference", "Telemetry since 2023; nominal 3.7 Hz; brake is Boolean coded as 0/100", "technical_reference", open_terms),
        source("OPENF1", "OpenF1 historical endpoints", "OpenF1", "https://openf1.org/", "Unauthenticated historical HTTPS; rate-limited", "Provider research/noncommercial intended use; upstream rights reserved", "Obtain provider and applicable upstream rights before product distribution", "Data is aggregated; 3 req/s and 30 req/min for Community; live feed requires sponsor access", "research_only", open_terms),
        source("FASTF1_DATA", "FastF1 data reference", "FastF1 contributors", "https://github.com/theOehrly/Fast-F1/blob/main/docs/data_reference/index.rst", "Public GitHub source and official docs", "Documentation and software MIT; upstream data separate", "Software under MIT terms; upstream Formula 1/Jolpica rights apply", "Timing, car and position streams documented from 2018; individual sessions may have gaps", "technical_reference", "https://github.com/theOehrly/Fast-F1/blob/main/LICENSE"),
        source("FASTF1_RELEASE", "FastF1 v3.9.2", "FastF1 contributors", "https://github.com/theOehrly/Fast-F1/releases/tag/v3.9.2", "Public release notes", "MIT software", "Software under MIT terms", "Version reviewed for capability; the empirical pilot uses OpenF1", "technical_reference", "https://github.com/theOehrly/Fast-F1/blob/main/LICENSE"),
        source("JOLPICA_TERMS", "Jolpica-F1 API Terms of Use", "Jolpica-F1 contributors", "https://github.com/jolpica/jolpica-f1/blob/main/TERMS.md", "Public terms", "CC BY-NC-SA 4.0 data", "Contact Jolpica for commercial use", "Historical results API; distinct from FastF1 timing and F1DB license", "rights_reference", date="2025-08-27"),
        source("F1_IP", "Formula 1 IP guidelines", "Formula 1", f1_terms, "Public rights guidelines", "Copyright/database rights and trademark terms", "Substantial results/timing reproduction or commercial use requires a rights basis", "Editorial incidental facts have narrower treatment", "rights_reference", f1_terms),
        source("FIA_TERMS", "Terms and conditions FIA website", "FIA", fia_terms, "Public PDF", "Publisher copyright and website terms", "Clear commercial use of protected materials with rights owner", "FIA-hosted documents can contain third-party notices", "rights_reference", fia_terms),
        source("FIA_SUZUKA26", "Japanese GP 2026 circuit map, version 3", "FIA", "https://www.fia.com/system/files/decision-document/2026_japanese_grand_prix_-_competition_notes_-_circuit_map_pit_lane_drawing_emergency_exits_map_battery_containment_area_and_red_zone.pdf", "Public decision document", "Source materials reserved", "Metadata citation only; diagram clearance required", "FIA corner numbering and lengths; no coordinate trace included", "editorial_reference", fia_terms, "2026-03-25"),
        source("FIA_SUZUKA25", "Japanese GP 2025 circuit map, version 1", "FIA", "https://www.fia.com/system/files/decision-document/2025_japanese_grand_prix_-_event_notes_-_circuit_map_pit_lane_quarantine_and_red_zone.pdf", "Public decision document", "Source materials reserved", "Metadata citation only; diagram clearance required", "2025 layout and operating markers", "editorial_reference", fia_terms, "2025-04-03"),
        source("PIRELLI_SUZUKA25", "To Suzuka for something new and something old", "Pirelli", "https://press.pirelli.com/to-suzuka-for-something-new-and-something-old/", "Public supplier preview", "Publisher rights reserved", "Editorial factual citation only", "Reports 2025 resurfacing; supplies tyre context", "editorial_reference"),
        source("PIRELLI_SUZUKA26", "The Suzuka challenge with the hardest trio in the range", "Pirelli", "https://press.pirelli.com/the-suzuka-challenge-with-the-hardest-trio-in-the-range/", "Public supplier preview", "Publisher rights reserved", "Editorial factual citation only", "Surface and compound context", "editorial_reference"),
        source("EA_UDP_25_26", "F1 25 and 2026 Season Pack official UDP specification", "Electronic Arts", ea_spec, "Public EA post and structure definitions", "Published interface specification; EA materials reserved", "Use interface documentation subject to applicable terms", "Select packet format and validate per-game version; attachments can be revised", "technical_reference", "https://www.ea.com/legal/user-agreement"),
        source("EA_TERMS", "EA User Agreement", "Electronic Arts", "https://www.ea.com/legal/user-agreement", "Public terms", "EA and licensor rights reserved", "Review applicable terms for deployment and collected game telemetry", "Also apply player consent and applicable privacy requirements", "rights_reference"),
        source("RACEMIND_CODE", "RaceMind AI repository snapshot", "RaceMind AI contributors", "https://github.com/T-Bone47/RaceMind-AI/tree/850d3c97e4fdf4aa37112efdde2e1eb7bfbd992d", "Read-only pinned checkout", "Repository terms and file notices apply", "Architecture inspection; source code not copied into dataset", "Deployment and live capture were not inspected", "technical_reference", date="2026-10-21"),
        source("SAVGOL", "Smoothing and Differentiation of Data by Simplified Least Squares Procedures", "Savitzky and Golay", "https://doi.org/10.1021/ac60214a047", "Publisher DOI", "Paper copyright reserved", "Method citation", "Filter window selected by project; requires holdout validation", "technical_reference", date="1964"),
        source("EFRON1979", "Bootstrap Methods: Another Look at the Jackknife", "Bradley Efron", "https://doi.org/10.1214/aos/1176344552", "Publisher DOI", "Paper rights reserved", "Method citation", "RaceMind must use independent blocks and assess stability", "technical_reference", date="1979"),
        source("SAE_MOMENT", "Moment Method - A Comprehensive Tool for Race Car Development", "Milliken, Wright and Milliken", "https://doi.org/10.4271/942538", "Publisher DOI", "Paper rights reserved", "Method citation", "Vehicle response depends on chassis, tyre and aero state", "technical_reference", date="1994"),
    ]

def link_evidence(evidence, sources):
    source_ids = {row["source_url"]: row["source_id"] for row in sources}
    for row in sorted(evidence, key=lambda item: item["source_url"]):
        url = row["source_url"]
        if url not in source_ids:
            identifier = "STYLE_" + hashlib.sha256(url.encode()).hexdigest()[:12].upper()
            source_ids[url] = identifier
            host = urlparse(url).hostname or ""
            rights = "https://www.formula1.com/en/information/guidelines.4EOKE9RRqevL4niTK9kWyt" if host.endswith("formula1.com") else None
            sources.append({
                **source(identifier, row["source_title"], row["publisher"], url, "Public publisher page or officially published interview/analysis", "Source text/media remain publisher property",
                         "Cite link and independently paraphrased factual context; no commercial corpus or media clearance established",
                         "See linked article and evidence limitations; original content and assets excluded", "editorial_research_only", rights, row["publication_date"]),
                "author": row["author"],
            })
        row["source_id"] = source_ids[url]
        row["usage"] = "editorial_research_only"

def trait(rows):
    if not rows:
        return dict(value=None, evidence_type=None, evidence_ids=[], applicable_context=[],
                    confidence="unestablished", missing_reason="No sufficiently scoped evidence captured in this release")
    return dict(
        value=[row["claim"] for row in rows],
        evidence_type=sorted({row["direct_or_inferred"] for row in rows}),
        evidence_ids=[row["evidence_id"] for row in rows],
        applicable_context=[{key: row[key] for key in ("evidence_id", "season", "team", "circuit")} for row in rows],
        confidence=min((row["confidence"] for row in rows), key=("low", "moderate", "high").index),
        missing_reason=None,
    )

CLASSES = {
    "heavy_braking_hairpin": "Single dominant slow turn with sustained heavy deceleration; register entry, apex and exit. Initial working gate: minimum speed below 100 km/h and approach speed loss above 90 km/h on the reference class sample.",
    "medium_speed": "Initial reference minimum-speed band 100 to <200 km/h. Assign by a frozen benchmark task/regulation stratum.",
    "high_speed": "Initial reference minimum speed >=200 km/h. Record any lift and aero-mode context.",
    "long_radius": "A sustained same-direction arc, initially >2 s from turn-in to unwind with no planned reversal. May overlap a speed class.",
    "direction_change": "Two or more consecutive opposite-sign curvature peaks with no intervening straight >=1 s in the reference sample.",
    "traction_limited_exit": "Exit regime with validated repeatable driven-wheel-slip or throttle/acceleration constraints; geometric exit classes are candidate labels until validated.",
    "high_downforce_context": "Configuration label for high aero load, recorded from independent setup evidence or known aero mode; speed alone does not establish it.",
    "low_downforce_context": "Configuration label for low aero load, recorded from independent setup evidence or known aero mode; venue reputation alone is insufficient.",
}
SUZUKA = [
    ("t01_t02", "T1–T2", "long_radius", "First-corner complex"),
    ("t03_t07", "T3–T7", "direction_change", "Esses to Dunlop; retain planned direction reversals"),
    ("t08_t09", "T8–T9", "medium_speed", "Degner two-stage right-hand complex; classify each turn after registering separate gates"),
    ("t11", "T11", "heavy_braking_hairpin", "Hairpin; traction-limited exit is a candidate tag"),
    ("t13_t14", "T13–T14", "long_radius", "Spoon; separate first entry, second apex and back-straight exit"),
    ("t15", "T15", "high_speed", "130R; stratify by aero mode and preceding deployment"),
    ("t16_t17", "T16–T17", "direction_change", "Chicane; substantial braking before first apex, separate traction phase"),
]
CORNER_EVIDENCE = {
    "EV-VER003": ("interlagos", "interlagos-2", "T1–T2", "direction_change"),
    "EV-VER004": ("zandvoort", "zandvoort-5", "T2–T3", "direction_change"),
    "EV-LEC003": ("paul-ricard", "paul-ricard-3", None, "long_radius"),
    "EV-LEC004": ("imola", "imola-3", "Variante Alta", "direction_change"),
    "EV-SAI004": ("paul-ricard", "paul-ricard-3", None, "long_radius"),
    "EV-OCO001": ("spa-francorchamps", "spa-francorchamps-4", "Fagnes", "direction_change"),
    "EV-MAS002": ("silverstone", "silverstone-8", "Brooklands–Luffield", "direction_change"),
}

def circuits(layouts):
    result = []
    for row in layouts:
        variants = [r["layout_id"] for r in layouts if r["circuit_id"] == row["circuit_id"] and r != row]
        result.append({**row, "record_type": "layout", "variant_ids": variants,
                       "notes": "Layout lineage and reported length variants; gate coordinates require game-build registration"})
    for identifier, definition in CLASSES.items():
        result.append({"record_type": "corner_class", "corner_class": identifier, "notes": definition})
    for identifier, label, cls, notes in SUZUKA:
        for version, season, sources, context in [
            ("suzuka-2-fia-2025", 2025, ["FIA_SUZUKA25", "PIRELLI_SUZUKA25"], "2025 resurfacing affects early lap"),
            ("suzuka-2-fia-2026", 2026, ["FIA_SUZUKA26", "PIRELLI_SUZUKA26"], "2026 surface and Straight Mode context differs"),
        ]:
            result.append({"record_type": "corner_candidate", "circuit_id": "suzuka", "circuit_name": "Suzuka Circuit",
                           "layout_id": "suzuka-2", "context_version": version, "event_seasons": [season],
                           "length_m": 5807, "turn_count": 18, "corner_id": identifier, "turn_label": label,
                           "corner_class": cls, "source_id": sources[0], "related_source_ids": sources[1:],
                           "notes": notes + ". " + context + ". Class is provisional; telemetry gates have yet to be registered."})
    return result

def load_empirical():
    path = RESEARCH / "empirical_features.json"
    return read(path) if path.exists() else []

def main():
    roster = read(RESEARCH / "roster.json")
    evidence = read(RESEARCH / "evidence.json")
    sources = read(RESEARCH / "roster_sources.json") + additional_sources()
    dictionary = read(ROOT / "telemetry_feature_dictionary.json")
    features = {row["feature_id"]: row for row in dictionary["features"]}
    layouts = read(RESEARCH / "circuit_layouts.json")
    empirical = load_empirical()
    link_evidence(evidence, sources)
    known_drivers = {row["id"] for row in roster}
    known_sources = {row["source_id"] for row in sources}
    assert len(known_drivers) == len(roster)
    assert len(known_sources) == len(sources)
    assert len({row["evidence_id"] for row in evidence}) == len(evidence)
    for row in evidence:
        assert row["driver_id"] in known_drivers, row
        assert row["trait_id"] in TRAITS + EXTRA_TRAITS, row
        assert row["confidence"] in {"high", "moderate", "low"}, row
        assert row["claim"] and row["limitations"] and row["source_url"].startswith("https://"), row
    seen = set()
    for row in empirical:
        assert row["driver_id"] in known_drivers, row
        assert row["feature_id"] in features, row
        assert row["unit"] == features[row["feature_id"]]["units"], row
        assert math.isfinite(row["value"]) and row["sample_count"] > 0, row
        assert not row["benchmark_eligible"] and row["usage"] == "research_only", row
        assert set(row["source_ids"]) <= known_sources, row
        key = tuple(row.get(name) for name in ("driver_id", "season", "team", "circuit_id", "layout_id", "session_type",
                                                "qualifying_segment", "sector", "feature_id"))
        assert key not in seen, key
        seen.add(key)
        row["context_id"] = "/".join(str(x) for x in key[1:-1] if x is not None)
        row["source_ids"] = sorted(set(row["source_ids"]) | {"OPENF1"})
        row["measurement_available"] = True
        row["measurement_type"] = row.get("measurement_type", "derived_from_public_feed")
        extras = {key: value for key, value in row.items() if key not in FEATURE_COLUMNS}
        row["qa"] = row.get("qa") or extras
    by_driver = defaultdict(list)
    quant_by_driver = defaultdict(list)
    for row in evidence:
        by_driver[row["driver_id"]].append(row)
    for row in empirical:
        quant_by_driver[row["driver_id"]].append(row)
    profiles, masters, seasons, numbers, quality, corner_profiles = [], [], [], [], [], []
    for driver in roster:
        identifier = driver["id"]
        observations = by_driver[identifier]
        quantitative = quant_by_driver[identifier]
        traits = {name: trait([row for row in observations if row["trait_id"] == name]) for name in TRAITS + EXTRA_TRAITS}
        present = sum(bool(row["evidence_ids"]) for row in traits.values())
        independent_urls = {row["source_url"] for row in observations}
        grade = "B" if present >= 3 and len(independent_urls) >= 3 else "C" if observations else "D"
        conf = "moderate" if grade == "B" else "low" if grade == "C" else "unestablished"
        source_ids = sorted(set(driver["source_ids"]) | {row["source_id"] for row in observations}
                            | {src for row in quantitative for src in row["source_ids"]})
        # Profile confidence measures documented context coverage, never driver-match confidence.
        condition_notes = [
            {"trait_id": name, "evidence_ids": traits[name]["evidence_ids"],
             "status": "multiple_contexts_or_sources", "resolution": "Read individual scope before treating reports as corroboration or disagreement."}
            for name in ("preferred_balance", "observed_balance", "braking_style", "steering_style", "adaptability")
            if len(traits[name]["evidence_ids"]) > 1
        ]
        conflicts = []
        if identifier == "leclerc":
            conflicts.append({"status": "contextual_tension", "trait_id": "preferred_balance", "evidence_ids": ["EV-LEC001", "EV-LEC002", "EV-LEC003"],
                              "resolution": "Self-stated rotation preference and sudden loss of rear grip describe different responses; long fast corners add a tyre cost."})
        if identifier == "verstappen":
            conflicts.append({"status": "contextual_tension", "trait_id": "preferred_balance", "evidence_ids": ["EV-VER001", "EV-VER002"],
                              "resolution": "Teammate's front-response account is scoped to 2019–20; the driver reports adapting to the early 2022 car."})
        if identifier == "rosberg":
            conflicts.append({"status": "contextual_tension", "trait_id": "steering_style", "evidence_ids": ["EV-ROS002"],
                              "resolution": "Published analysis described circuit-specific differences from the broader comparison."})
        coverage = {"grade": grade, "documented_traits": present, "defined_profile_traits": len(traits),
                    "independent_style_urls": len(independent_urls), "research_telemetry_rows": len(quantitative),
                    "reference_match_eligible": False, "profile_scope": driver["priority"]}
        profiles.append(dict(driver_id=identifier, profile_version=VERSION, season_or_era=driver["historical_era"],
                             team_and_car_context=driver["season_context"], **traits,
                             evidence=[row["evidence_id"] for row in observations], conflicting_evidence=conflicts,
                             contextual_variation=condition_notes, data_coverage=coverage,
                             overall_confidence=conf, last_updated=DATE))
        masters.append(dict(driver_id=identifier, full_name=driver["full_name"], racing_name=driver["racing_name"],
                            nationality=driver["nationality"], career_start_year=driver["start_year"],
                            career_end_year=driver["end_year"], seasons_competed=sorted(map(int, driver["seasons"])),
                            verified_teams_by_season=driver["seasons"], historical_era=driver["historical_era"],
                            data_coverage_grade=grade, source_count=len(source_ids), last_verified_at=DATE,
                            last_start_year=driver["last_start_year"], priority=driver["priority"], f1db_id=driver["f1db_id"],
                            aliases=driver["aliases"], source_ids=source_ids))
        quality.append(dict(scope="driver", driver_id=identifier, priority=driver["priority"], supported_count=present,
                            possible_count=len(traits), evidence_count=len(observations), unique_style_sources=len(independent_urls),
                            research_numeric_count=len(quantitative), status=grade, match_eligible=False))
        for name, item in traits.items():
            quality.append(dict(scope="driver_trait", driver_id=identifier, priority=driver["priority"], trait_id=name,
                                supported_count=int(bool(item["evidence_ids"])), possible_count=1,
                                evidence_count=len(item["evidence_ids"]), status=item["confidence"], match_eligible=False,
                                notes=item["missing_reason"]))
        for season, context in driver["season_context"].items():
            scoped = [row for row in observations if str(row["season"]) == season]
            sample = [row for row in quantitative if str(row["season"]) == season]
            status = "context_and_evidence" if scoped or sample else "context_only"
            seasons.append(dict(driver_id=identifier, season=season, team_and_car_context=context["teams"],
                                race_starts=context["race_starts"], regulation_era=context["regulation_era"],
                                observations=[{"claim": row["claim"], "evidence_id": row["evidence_id"]} for row in scoped],
                                evidence_ids=[row["evidence_id"] for row in scoped], record_status=status,
                                context_cutoff=DATE if season == "2026" else None,
                                research_numeric_count=len(sample), source_ids=sorted(set(driver["source_ids"])
                                | {row["source_id"] for row in scoped} | {src for row in sample for src in row["source_ids"]})))
            quality.append(dict(scope="driver_season", driver_id=identifier, season=season, priority=driver["priority"],
                                evidence_count=len(scoped), research_numeric_count=len(sample), status=status, match_eligible=False))
        for feature_id, spec in features.items():
            if any(row["feature_id"] == feature_id for row in quantitative):
                continue
            channel_missing = spec["real_f1_compatibility"] in {"not_currently_comparable", "qualitative_resemblance_only"}
            reason = "public_measurement_unavailable" if channel_missing else "no_contextual_measurement_in_release"
            numbers.append(dict(driver_id=identifier, feature_id=feature_id, unit=spec["units"], measurement_available=False,
                                benchmark_eligible=False, usage="schema_only", confidence="unestablished", missing_reason=reason))
        numbers.extend(quantitative)
        for row in observations:
            if row["evidence_id"] in CORNER_EVIDENCE:
                circuit_id, layout_id, corner, cls = CORNER_EVIDENCE[row["evidence_id"]]
                corner_profiles.append(dict(driver_id=identifier, season=row["season"], circuit_id=circuit_id, layout_id=layout_id,
                                            corner_label=corner, corner_class=cls, claim=row["claim"], evidence_id=row["evidence_id"],
                                            source_id=row["source_id"], measurement_type="qualitative_contextual",
                                            measurement_available=False, confidence=row["confidence"], limitations=row["limitations"]))
    for category, count in Counter(row["evidence_category"] for row in evidence).items():
        quality.append(dict(scope="source_type", source_type=category, evidence_count=count,
                            supported_count=len({row["driver_id"] for row in evidence if row["evidence_category"] == category}),
                            match_eligible=False, status="claims_reviewed"))
    for name in TRAITS + EXTRA_TRAITS:
        quality.append(dict(scope="trait", trait_id=name, supported_count=sum(bool(row[name]["evidence_ids"]) for row in profiles),
                            possible_count=len(profiles), evidence_count=sum(row["trait_id"] == name for row in evidence),
                            match_eligible=False, status="release_coverage"))
    for season in sorted({row["season"] for row in seasons}, key=int):
        scoped = [row for row in seasons if row["season"] == season]
        quality.append(dict(scope="season", season=season, supported_count=sum(row["record_status"] == "context_and_evidence" for row in scoped),
                            possible_count=len(scoped), evidence_count=sum(len(row["evidence_ids"]) for row in scoped),
                            research_numeric_count=sum(row["research_numeric_count"] for row in scoped), match_eligible=False,
                            status="partial_season" if season == "2026" else "release_coverage"))
    write_csv("drivers_master.csv", ("driver_id", "full_name", "racing_name", "nationality", "career_start_year", "career_end_year",
              "seasons_competed", "verified_teams_by_season", "historical_era", "data_coverage_grade", "source_count", "last_verified_at",
              "last_start_year", "priority", "f1db_id", "aliases", "source_ids"), masters)
    write_json("driver_style_profiles.json", profiles)
    write_csv("driver_style_features.csv", FEATURE_COLUMNS, numbers)
    write_csv("driver_season_profiles.csv", ("driver_id", "season", "team_and_car_context", "race_starts", "regulation_era",
              "observations", "evidence_ids", "record_status", "context_cutoff", "research_numeric_count", "source_ids"), seasons)
    write_csv("driver_corner_profiles.csv", ("driver_id", "season", "circuit_id", "layout_id", "corner_label", "corner_class", "claim",
              "evidence_id", "source_id", "measurement_type", "measurement_available", "confidence", "limitations"), corner_profiles)
    write_csv("driver_evidence.csv", EVIDENCE_COLUMNS, evidence)
    write_csv("circuits_and_corner_classes.csv", ("record_type", "circuit_id", "circuit_name", "layout_id", "context_version", "event_seasons",
              "length_m", "turn_count", "variant_ids", "course_lengths_m_in_modern_results", "first_observed_year", "last_observed_year",
              "corner_id", "turn_label", "corner_class", "source_id", "related_source_ids", "notes"), circuits(layouts))
    write_csv("source_registry.csv", SOURCE_COLUMNS, sources)
    write_csv("coverage_and_quality_report.csv", ("scope", "driver_id", "priority", "season", "trait_id", "source_type", "supported_count",
              "possible_count", "evidence_count", "unique_style_sources", "research_numeric_count", "status", "match_eligible", "notes"), quality)
    print(json.dumps({"drivers": len(roster), "grades": Counter(row["data_coverage_grade"] for row in masters), "style_claims": len(evidence),
                      "drivers_with_style": sum(bool(rows) for rows in by_driver.values()), "driver_seasons": len(seasons), "context_and_evidence_seasons": sum(row["record_status"] == "context_and_evidence" for row in seasons),
                      "corner_observations": len(corner_profiles), "numeric_observations": len(empirical),
                      "numeric_drivers": sum(bool(rows) for rows in quant_by_driver.values()), "feature_definitions": len(features), "sources": len(sources)}, indent=2))

if __name__ == "__main__":
    main()


