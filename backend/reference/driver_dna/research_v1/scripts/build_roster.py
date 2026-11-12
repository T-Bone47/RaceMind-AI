"""Extract RaceMind identity, race-start and circuit metadata from pinned F1DB.

F1DB contributors, CC BY 4.0: https://github.com/f1db/f1db/releases/tag/v2026.20.0
Transformations: race-start filtering, selection, joins, grouping, unit conversion,
and RaceMind IDs. No timing traces, media, or source archive are emitted.
"""

import argparse
import csv
import hashlib
import io
import json
import unicodedata
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path


RELEASE = "v2026.20.0"
RELEASE_URL = f"https://github.com/f1db/f1db/releases/tag/{RELEASE}"
ZIP_URL = f"https://github.com/f1db/f1db/releases/download/{RELEASE}/f1db-json-splitted.zip"
ZIP_SHA256 = "d646ef0dd92dff39b8b91e6b750669f5a85999a04180ade79e3f0dba2fdcc902"
AS_OF = "2026-11-12"
SOURCE = "F1DB_2026_20_0"
NON_START = {"DNS", "DNQ", "DNPQ", "DNP", "EX"}

# IDs are RaceMind identifiers. F1DB-native IDs remain available for joins.
MODERN_IDS = dict(line.split() for line in """
adrian-sutil sutil
alexander-albon albon
alexander-rossi rossi
andre-lotterer lotterer
antonio-giovinazzi giovinazzi
arvid-lindblad lindblad
brendon-hartley hartley
carlos-sainz-jr sainz
charles-leclerc leclerc
daniel-ricciardo ricciardo
daniil-kvyat kvyat
esteban-gutierrez gutierrez
esteban-ocon ocon
felipe-massa massa
felipe-nasr nasr
fernando-alonso alonso
franco-colapinto colapinto
gabriel-bortoleto bortoleto
george-russell russell
guanyu-zhou zhou
isack-hadjar hadjar
jack-aitken aitken
jack-doohan doohan
jean-eric-vergne vergne
jenson-button button
jolyon-palmer palmer
jules-bianchi bianchi
kamui-kobayashi kobayashi
kevin-magnussen kevin_magnussen
kimi-antonelli antonelli
kimi-raikkonen raikkonen
lance-stroll stroll
lando-norris norris
lewis-hamilton hamilton
liam-lawson lawson
logan-sargeant sargeant
marcus-ericsson ericsson
max-chilton chilton
max-verstappen verstappen
mick-schumacher mick_schumacher
nicholas-latifi latifi
nico-hulkenberg hulkenberg
nico-rosberg rosberg
nikita-mazepin mazepin
nyck-de-vries de_vries
oliver-bearman bearman
oscar-piastri piastri
pascal-wehrlein wehrlein
pastor-maldonado maldonado
paul-di-resta di_resta
pierre-gasly gasly
pietro-fittipaldi pietro_fittipaldi
rafael-camara camara
rio-haryanto haryanto
robert-kubica kubica
roberto-merhi merhi
romain-grosjean grosjean
ryo-hirakawa hirakawa
sebastian-vettel vettel
sergey-sirotkin sirotkin
sergio-perez perez
stoffel-vandoorne vandoorne
valtteri-bottas bottas
will-stevens stevens
yuki-tsunoda tsunoda
""".strip().splitlines())

HISTORIC_IDS = dict(line.split() for line in """
alain-prost prost
alan-jones alan_jones
ayrton-senna senna
damon-hill damon_hill
emerson-fittipaldi fittipaldi
gilles-villeneuve gilles_villeneuve
graham-hill graham_hill
jack-brabham brabham
jackie-stewart stewart
jacky-ickx ickx
jacques-villeneuve jacques_villeneuve
james-hunt hunt
jim-clark clark
jochen-rindt rindt
john-surtees surtees
juan-manuel-fangio fangio
juan-pablo-montoya montoya
keke-rosberg keke_rosberg
mario-andretti mario_andretti
michael-schumacher michael_schumacher
mika-hakkinen hakkinen
nelson-piquet piquet
nigel-mansell mansell
niki-lauda lauda
stirling-moss moss
""".strip().splitlines())

RACING_ALIASES = {
    "albon": ["Alex Albon"], "antonelli": ["Andrea Kimi Antonelli"],
    "bearman": ["Ollie Bearman"], "camara": ["Rafa Câmara"],
    "perez": ["Checo Pérez"], "sainz": ["Carlos Sainz"], "zhou": ["Zhou Guanyu"],
}

ROSTER_CROSSCHECK = "F1_2026_STANDINGS"
DRIVER_CROSSCHECKS = {
    "lotterer": ["F1_2014_BELGIUM_RESULT"], "button": ["F1_2017_MONACO_RESULT"],
    "di_resta": ["F1_2017_HUNGARY_RESULT"],
    "hadjar": ["F1_2026_SUB_RED_BULL", "FIA_2025_AUSTRALIA_DNS"],
    "lawson": ["F1_2026_SUB_RED_BULL"], "tsunoda": ["F1_2026_SUB_RED_BULL"],
    "ocon": ["F1_2026_SUB_HIRAKAWA", "F1_2026_SUB_CAMARA"],
    "hirakawa": ["F1_2026_SUB_HIRAKAWA"], "camara": ["F1_2026_SUB_CAMARA", "FIA_2026_SAO_PAULO_FINAL"],
}


def write_json(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_zip(archive):
    if archive:
        payload = archive.read_bytes()
    else:
        request = urllib.request.Request(ZIP_URL, headers={"User-Agent": "RaceMind roster research/1.0"})
        with urllib.request.urlopen(request, timeout=45) as response:
            payload = response.read()
    if hashlib.sha256(payload).hexdigest() != ZIP_SHA256:
        raise ValueError(f"Source archive differs from pinned {RELEASE} SHA-256")
    return zipfile.ZipFile(io.BytesIO(payload))


def catalog(archive, name):
    return json.loads(archive.read(f"f1db-{name}.json"))


def lookup(archive, name):
    return {item["id"]: item for item in catalog(archive, name)}


def ascii_name(name):
    return unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")


def era(year):
    if year >= 2026:
        return "2026_active_aero_hybrid"
    if year >= 2022:
        return "2022_2025_ground_effect_hybrid"
    if year >= 2017:
        return "2017_2021_wide_aero_hybrid"
    if year >= 2014:
        return "2014_2016_turbo_hybrid"
    return "pre_2014_historical"


def race_starts(archive, races):
    results = catalog(archive, "races-race-results")
    classified_race_ids = {r["raceId"] for r in results if r["raceId"] in races}
    rows = defaultdict(lambda: defaultdict(list))
    for row in results:
        if row["raceId"] not in races or row["positionText"] in NON_START:
            continue
        # F1DB marks Hadjar's Australian 2025 formation lap crash as DNF.
        # FIA's classification and Formula 1's official driver results specify DNS.
        if "formation lap" in (row["reasonRetired"] or "").casefold():
            continue
        rows[row["driverId"]][row["year"]].append(row)
    return rows, classified_race_ids


def season_context(archive):
    constructors = lookup(archive, "constructors")
    entrant_names = lookup(archive, "entrants")
    chassis_names = lookup(archive, "chassis")
    entrants = defaultdict(set)
    chassis = defaultdict(set)
    constructor_entrants = defaultdict(set)
    for item in catalog(archive, "seasons-entrants-drivers"):
        if item["testDriver"]:
            continue
        for round_number in item["rounds"]:
            key = (item["year"], round_number, item["driverId"], item["constructorId"], item["engineManufacturerId"])
            entrants[key].add(item["entrantId"])
    for item in catalog(archive, "seasons-entrants-chassis"):
        key = (item["year"], item["entrantId"], item["constructorId"], item["engineManufacturerId"])
        chassis[key].add(chassis_names[item["chassisId"]]["fullName"])
        constructor_entrants[(item["year"], item["constructorId"], item["engineManufacturerId"])].add(item["entrantId"])
    return constructors, entrant_names, entrants, chassis, constructor_entrants


def contextualize(rows, context):
    constructors, entrant_names, entrants, chassis, constructor_entrants = context
    by_constructor = defaultdict(list)
    for row in rows:
        by_constructor[row["constructorId"]].append(row)
    records = []
    for constructor_id, constructor_rows in sorted(by_constructor.items()):
        names, models = set(), set()
        context_basis = set()
        for row in constructor_rows:
            key = (row["year"], row["round"], row["driverId"], constructor_id, row["engineManufacturerId"])
            matched_entrants = entrants.get(key)
            if matched_entrants:
                context_basis.add("entrant_round_join")
                names.update(entrant_names[entrant_id]["name"] for entrant_id in matched_entrants)
            else:
                matched_entrants = constructor_entrants.get((row["year"], constructor_id, row["engineManufacturerId"]), ())
                if matched_entrants:
                    context_basis.add("constructor_engine_season_pool")
            for entrant_id in matched_entrants:
                models.update(chassis.get((row["year"], entrant_id, constructor_id, row["engineManufacturerId"]), ()))
        records.append({
            "constructor_id": constructor_id,
            "constructor": constructors[constructor_id]["name"],
            "entrant_names": sorted(names),
            "chassis_candidates": sorted(models),
            "chassis_context_basis": sorted(context_basis),
            "started_rounds": sorted({row["round"] for row in constructor_rows}),
        })
    return records


def identities(archive, starts, current_year):
    drivers = lookup(archive, "drivers")
    countries = lookup(archive, "countries")
    stable_ids = MODERN_IDS | HISTORIC_IDS
    context = season_context(archive)
    selected, historical_index = [], []
    for native_id, by_season in sorted(starts.items()):
        driver = drivers[native_id]
        years = sorted(by_season)
        racing_name = driver["name"]
        full_name = driver["fullName"] or racing_name
        driver_id = stable_ids.get(native_id, native_id.replace("-", "_"))
        country = countries[driver["nationalityCountryId"]]
        priority = "A" if years[-1] >= current_year - 5 else "B" if years[-1] >= 2014 else "C"
        aliases = {ascii_name(racing_name), ascii_name(full_name), *RACING_ALIASES.get(driver_id, ())}
        fields = {
            "id": driver_id,
            "f1db_id": native_id,
            "full_name": full_name,
            "racing_name": racing_name,
            "nationality": country["demonym"],
            "nationality_code": country["iocCode"],
            "start_year": years[0],
            "end_year": None if current_year in by_season else years[-1],
            "last_start_year": years[-1],
            "priority": priority,
        }
        source_ids = [SOURCE]
        if current_year in by_season:
            source_ids.append(ROSTER_CROSSCHECK)
        source_ids.extend(DRIVER_CROSSCHECKS.get(driver_id, ()))
        historical_index.append(fields | {
            "seasons_competed": "|".join(map(str, years)),
            "selected_for_profile": priority != "C" or native_id in HISTORIC_IDS,
            "source_id": SOURCE,
        })
        if priority == "C" and native_id not in HISTORIC_IDS:
            continue
        teams = {year: contextualize(by_season[year], context) for year in years}
        selected.append(fields | {
            "abbreviation": driver["abbreviation"],
            "aliases": sorted(aliases - {racing_name}),
            "seasons": {year: [team["constructor"] for team in teams[year]] for year in years},
            "season_context": {
                year: {"regulation_era": era(year), "teams": teams[year],
                       "race_starts": len({r["raceId"] for r in by_season[year]})}
                for year in years
            },
            "historical_era": list(dict.fromkeys(era(year) for year in years)),
            "source_ids": source_ids,
        })
    if len({d["id"] for d in historical_index}) != len(historical_index):
        raise ValueError("Duplicate stable driver IDs")
    return selected, historical_index


def layout_metadata(archive, classified):
    circuits = lookup(archive, "circuits")
    layouts = lookup(archive, "circuits-layouts")
    grouped = defaultdict(list)
    for race in catalog(archive, "races"):
        if race["id"] in classified:
            grouped[race["circuitLayoutId"]].append(race)
    result = []
    for layout_id, events in sorted(grouped.items()):
        modern = [event for event in events if event["year"] >= 2014]
        if not modern:
            continue
        layout = layouts[layout_id]
        circuit = circuits[layout["circuitId"]]
        result.append({
            "circuit_id": circuit["id"],
            "circuit_name": circuit["fullName"],
            "layout_id": layout_id,
            "event_seasons": sorted({event["year"] for event in modern}),
            "length_m": round(layout["length"] * 1000) if layout["length"] else None,
            "turn_count": layout["turns"],
            "course_lengths_m_in_modern_results": sorted({round(event["courseLength"] * 1000) for event in modern if event["courseLength"]}),
            "first_observed_year": min(event["year"] for event in events),
            "last_observed_year": max(event["year"] for event in events),
            "source_id": SOURCE,
        })
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Optional already downloaded official release ZIP")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "research")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    with read_zip(args.archive) as archive:
        races = {r["id"]: r for r in catalog(archive, "races") if r["date"] <= AS_OF}
        current_year = int(AS_OF[:4])
        starts, classified = race_starts(archive, races)
        selected, historical_index = identities(archive, starts, current_year)
        layouts = layout_metadata(archive, classified)

    current_drivers = [d for d in selected if d["last_start_year"] == current_year]
    current_races = [races[race_id] for race_id in classified if races[race_id]["year"] == current_year]
    if len(current_drivers) != 25 or len(current_races) != 20:
        raise ValueError("Pinned snapshot does not reconcile to official 2026 roster and calendar")
    current_names = {d["id"] for d in current_drivers}
    if not {"hirakawa", "camara", "tsunoda"} <= current_names:
        raise ValueError("Pinned snapshot is missing one or more official substitutes")

    write_json(args.output / "roster.json", selected)
    write_json(args.output / "circuit_layouts.json", layouts)
    with (args.output / "historical_driver_index.csv").open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=list(historical_index[0]))
        writer.writeheader()
        writer.writerows(historical_index)

    print(f"Selected roster: {dict(Counter(d['priority'] for d in selected))}")
    print(f"All-time index: {len(historical_index)} drivers, {len(classified)} race classifications")
    print(f"Current-season coverage: {len(current_drivers)} starters, {len(current_races)} races, through {max(r['date'] for r in current_races)}")
    print(f"Modern circuit layouts: {len(layouts)}")


if __name__ == "__main__":
    main()
