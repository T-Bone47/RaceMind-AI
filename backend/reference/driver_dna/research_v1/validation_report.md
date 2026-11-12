# Validation report

The release validator checks CSV column integrity, JSON parsing, key uniqueness, roster scope counts, cross-table identity and provenance, metric units, numeric bounds, missing values, case-study evidence references and research-only eligibility. All checks passed. The manifest records SHA-256 digests of the packaged files.

The roster extractor reproduced the pinned metadata. All 13 modern seasons were cross-checked against official standings and exceptions against individual races. The Suzuka processor reproduced a byte-identical set of 95 estimates from the cached inputs. Of 100 candidate laps, 21 passed the whole-lap gate. The processor rejected 91 windows in 2025 and 187 in 2026 for low bracket coverage. It found no duplicate car timestamps in the pilot. Sample code 104 remains unknown and was excluded. [Roster audit](research/roster_audit.md) · [Pilot audit](research/pilot_audit.md)

| Scope | Release status |
| --- | --- |
| Driver master | Complete for 2014–2026 race starts through cutoff. Earlier detailed driver selection is partial. |
| Style profiles and evidence | 90 structures, 50 drivers with scoped qualitative claims, 106 claims total. Seven claim dates unknown. No match-eligible profiles. |
| Season profiles | 684 career-context rows. 84 carry scoped claims or pilot observations. |
| Numeric features | 95 research-only rows for binary activation fraction. Other metrics have availability rows with null values. |
| Corner profiles | Seven qualitative observations. Numerical named-corner references unavailable. |
| Circuits and feature schema | 40 modern layout IDs, provisional Suzuka labels and 71 metric definitions. No calibrated game-corner gates. |
| Archetypes | Eight candidate continuous axes. Empirical separability and assignments unvalidated. |
| Source and quality tables | 101 registered sources and machine-readable quality facets. Commercial use eligibility depends on source and purpose. |
| Integration | Pinned repository inspection and 10 existing synthetic 2025/2026 parser tests passed. Live capture and deployed behaviour untested. |

No held-out model accuracy, cross-circuit reliability, calibrated confidence, causal coaching gain or subgroup fairness was measured. The two pilot sessions share one circuit and differ in regulation, surface and sample availability. Selective retention can bias year and driver comparisons. The matching specification defines the sensitivity and holdout tests required before accepting named ranks.
