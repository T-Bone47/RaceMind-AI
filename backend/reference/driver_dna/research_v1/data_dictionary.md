# Data dictionary

CSV files use UTF-8, headers, decimal points and blank cells for null. JSON arrays and objects inside CSV cells use standard JSON. Zero is a measured value where applicable. Lowercase booleans are explicit. IDs are case-sensitive. Driver IDs are stable release join keys. Years refer to the sporting season. Timestamps refer to source/session clocks as specified. Release dates use ISO 8601.

| File | Grain and primary key | Notes |
| --- | --- | --- |
| drivers_master.csv | driver_id | Career end is null for drivers who started in the open 2026 season. Teams are constructors grouped by season. Source count includes metadata and evidence. |
| driver_style_profiles.json | driver_id, profile_version | Each trait contains verbatim schema keys value, evidence_type, evidence_ids, applicable_context, confidence and missing_reason. Values are research paraphrases with individual contexts. |
| driver_evidence.csv | evidence_id | Category and inference fields describe origin. Confidence applies to the scoped claim. Blank publication dates were unavailable. |
| driver_style_features.csv | driver_id, feature_id, context_id | Blank context indicates a missing availability row. Numeric rows carry unit, sample and session counts, provenance, method, QA and research-only rights. Sample count counts contributing laps. |
| driver_season_profiles.csv | driver_id, season | Chassis candidate lists can include multiple variants. Only evidence with a single exact season joins here. |
| driver_corner_profiles.csv | evidence_id | Scoped qualitative claims. Blank corner means the source discussed a class or circuit section. |
| circuits_and_corner_classes.csv | record_type plus layout_id, corner_class or context_version and corner_id | Multiple layout IDs or distances encode recorded variants. Provisional labels need game gate registration. |
| telemetry_feature_dictionary.json | feature_id | Units, formula, filtering, quality policy, confounders and failure conditions. |
| driving_archetypes.json | archetype_id | Continuous candidate axes with scoped examples. |
| source_registry.csv | source_id | Publisher/access, rights, date and permitted-purpose notes. |
| coverage_and_quality_report.csv | scope plus corresponding driver, season, trait or source type | Counts and eligibility by facet. |
| real_f1_game_compatibility.csv | feature_id | Physical observability category, independent of product eligibility. |

Coverage grades apply to the qualitative profile. B means at least three documented traits across at least three source URLs, which may still share an upstream witness. C means at least one documented trait with narrower coverage. D means career metadata only in the qualitative profile. A is reserved for independently validated, context-conditioned match references. Priority A/B/C is a separate driver-scope field. No grade proves a technique persists over time.
