# RaceMind Driver DNA research dataset

Release 1.0.0 · 12 November 2026, Asia/Kolkata · 2026 results through the São Paulo Grand Prix on 8 November.

## A. Executive findings

- The release covers all 65 verified Grand Prix starters from 2014 through the cutoff, including 25 in 2026. The 90 structured profiles include 25 additional historical references. A separate index covers 794 starters in the pinned source, including championship Indianapolis rounds. [Roster audit](research/roster_audit.md)
- The library contains 106 scoped qualitative claims for 50 drivers, including all 38 Priority A drivers. Forty profiles have identity and career context only. The 684 driver-season records include 84 with scoped evidence or a research measurement. Seven contextual corner observations are qualitative.
- The Suzuka pilot yields 95 coarse binary-brake occupancy estimates across 23 drivers, from two qualifying sessions. Public brake state is binary and subject to packet gaps. Steering input, pressure, and pedal release shape remain unmeasured by the public sources. [Pilot audit](research/pilot_audit.md) · [OpenF1](https://openf1.org/docs/)
- The release supports provenance-aware research, player-side feature extraction design and local coaching integration. Ranked player-to-professional matching requires cleared references and held-out cross-domain validation. Every current reference row fails eligibility for product matching.

## B. Driver profiles

Start with [drivers_master.csv](drivers_master.csv), [driver_style_profiles.json](driver_style_profiles.json) and [driver_evidence.csv](driver_evidence.csv). Profile values preserve source scope. Driver-reported preference, observed car behaviour and competitive outcomes have different meanings.

## C. Machine-readable release

[Manifest](dataset_manifest.json) · [Data dictionary](data_dictionary.md) · [Coverage by driver, trait and season](coverage_and_quality_report.csv) · [Season profiles](driver_season_profiles.csv) · [Corner profiles](driver_corner_profiles.csv) · [Circuit and corner classes](circuits_and_corner_classes.csv) · [Numeric features](driver_style_features.csv) · [Historical index](research/historical_driver_index.csv)

## D. Feature engineering

[Methodology](methodology.md) · [71 feature definitions](telemetry_feature_dictionary.json) · [Real F1 to game compatibility matrix](real_f1_game_compatibility.csv) · [Research dimensions](driver_style_ontology.json)

## E. Matching model

[Matching specification and Suzuka example](matching_model.md) · [Candidate style axes](driving_archetypes.json)

## F. Driver comparisons

[Eight driver comparison case studies](case_studies.md)

## G. RaceMind integration

[Integration specification at the inspected repository revision](integration_specification.md)

## H. Quality and rights

[Validation](validation_report.md) · [Limitations](limitations.md) · [Source licensing](source_licensing.md) · [Source registry](source_registry.csv)

## I. Research roadmap

1. Extend RaceMind's existing capture path and verify EA build-specific packet fixtures. Record repeated clean laps at multiple tracks with setup, assists, device and weather. Validate gate registration at Suzuka against independent game traces.
2. Obtain commercial rights to reference data and applicable derived outputs, then collect repeated real sessions on matched layouts and tasks. Prioritize binary braking and well-aligned kinematics. For steering, brake pressure, and balance work, prioritize rights-cleared team or driver-in-the-loop telemetry.
3. Run a simulator crossover with consented drivers, including wheel/pad and assist conditions where appropriate. Use a prespecified elicitation protocol and blind independent coaches to driver name. Audit annotation agreement before assigning qualitative style directions.
4. Hold out weekends, circuits and participants. Test abstention, repeatability, team/device effects and subgroup coverage before enabling named matches. Reaudit the eight cases and expand the least documented drivers and contexts first.

## Reproduce

Python standard library suffices for the release scripts. Run from the extracted folder.

```text
python scripts/build_feature_dictionary.py
python -B scripts/build_ontology.py
python scripts/build_release.py
python scripts/validate_release.py
```

The curated evidence is pinned in research/evidence.json. To refresh the roster from pinned F1DB, use python scripts/build_roster.py --help and follow the roster audit. For the empirical pilot, run python scripts/fetch_openf1_pilot.py PRIVATE_CACHE then python scripts/process_openf1_pilot.py PRIVATE_CACHE. Use a private directory outside the release and follow the provider's research-use policy. A later upstream revision can change the results.
