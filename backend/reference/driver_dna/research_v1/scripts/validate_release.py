import csv
import hashlib
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def table(name):
    with (ROOT / name).open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        rows = list(reader)
        assert all(None not in row and None not in row.values() for row in rows), name
        return rows

def obj(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8-sig"))

def unique(rows, *keys):
    result = {tuple(row[k] for k in keys) for row in rows}
    assert len(rows) == len(result), keys

def main():
    master = table("drivers_master.csv")
    profiles = obj("driver_style_profiles.json")
    sources = table("source_registry.csv")
    evidence = table("driver_evidence.csv")
    metrics = obj("telemetry_feature_dictionary.json")["features"]
    numbers = table("driver_style_features.csv")
    seasons = table("driver_season_profiles.csv")
    corners = table("driver_corner_profiles.csv")
    layouts = table("circuits_and_corner_classes.csv")
    compatibility = table("real_f1_game_compatibility.csv")
    history = table("research/historical_driver_index.csv")
    ids = {row["driver_id"] for row in master}
    evidence_ids = {row["evidence_id"] for row in evidence}
    source_ids = {row["source_id"] for row in sources}
    units = {row["feature_id"]: row["units"] for row in metrics}
    for rows, keys in [
        (master, ("driver_id",)), (profiles, ("driver_id",)), (sources, ("source_id",)),
        (evidence, ("evidence_id",)), (metrics, ("feature_id",)), (compatibility, ("feature_id",)),
        (numbers, ("driver_id", "feature_id", "context_id")), (seasons, ("driver_id", "season")),
        (corners, ("evidence_id",)),
    ]:
        unique(rows, *keys)
    assert ids == {row["driver_id"] for row in profiles}
    assert len([row for row in master if row["priority"] in {"A", "B"}]) == 65
    assert sum(2026 in json.loads(row["seasons_competed"]) for row in master) == 25
    assert {row["driver_id"] for row in master if row["priority"] == "A"} <= {r["driver_id"] for r in evidence}
    assert set(units) == {row["feature_id"] for row in compatibility}
    for row in profiles:
        assert set(row["evidence"]) <= evidence_ids and not row["data_coverage"]["reference_match_eligible"]
        assert all(set(item["evidence_ids"]) <= evidence_ids for item in row["conflicting_evidence"])
    for row in evidence:
        assert row["driver_id"] in ids and row["source_id"] in source_ids
    for row in seasons:
        assert row["driver_id"] in ids and set(json.loads(row["evidence_ids"])) <= evidence_ids
        assert set(json.loads(row["source_ids"])) <= source_ids
    for row in corners:
        assert row["driver_id"] in ids and row["evidence_id"] in evidence_ids and row["source_id"] in source_ids
    for row in layouts:
        assert not row["source_id"] or row["source_id"] in source_ids
        assert not row["related_source_ids"] or set(json.loads(row["related_source_ids"])) <= source_ids
    for row in numbers:
        assert row["driver_id"] in ids and row["unit"] == units[row["feature_id"]]
        assert row["benchmark_eligible"] == "false"
        if row["measurement_available"] == "true":
            value = float(row["value"])
            assert math.isfinite(value) and row["usage"] == "research_only"
            assert set(json.loads(row["source_ids"])) <= source_ids
            assert int(row["sample_count"]) >= 1 and int(row["session_count"]) == 1
            if row["feature_id"] == "brake_activation_fraction":
                assert 0 <= value <= 1
                qa = json.loads(row["qa"])
                assert qa["min_window_coverage"] >= 0.97 and qa["min_window_median_native_hz"] >= 3
                assert qa["conditional_window_bound_low"] <= value <= qa["conditional_window_bound_high"]
        else:
            assert row["value"] == "" and row["missing_reason"]
    for row in obj("driving_archetypes.json")["archetypes"]:
        assert set(row["game_feature_ids"]) <= set(units)
        assert set(row["evidence_ids"]) <= evidence_ids
    assert set(re.findall(r"EV-[A-Z]+\d+", (ROOT / "case_studies.md").read_text(encoding="utf-8-sig"))) <= evidence_ids
    files = {}
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.name == "dataset_manifest.json" or path.suffix == ".pyc":
            continue
        files[path.relative_to(ROOT).as_posix()] = {"bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    counts = {"drivers": len(ids), "evidence": len(evidence), "driver_seasons": len(seasons), "corners": len(corners),
              "historical_index": len(history), "features": len(metrics), "source_registry": len(sources),
              "numeric_research_rows": sum(row["measurement_available"] == "true" for row in numbers),
              "eligible_numeric_rows": 0}
    result = {"release_version": "1.0.0", "schema_version": "1.0.0", "research_as_of": "2026-11-12",
              "timezone": "Asia/Kolkata", "last_2026_race": "2026-11-08", "release_status": "research",
              "architecture_revision": "850d3c97e4fdf4aa37112efdde2e1eb7bfbd992d", "counts": counts, "files": files}
    (ROOT / "dataset_manifest.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(counts, indent=2))

if __name__ == "__main__":
    main()
