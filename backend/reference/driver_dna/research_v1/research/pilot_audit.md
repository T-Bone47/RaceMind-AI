# OpenF1 Suzuka pilot audit

The predeclared sample includes Suzuka 2025 and 2026 qualifying Q1, sessions 10002 and 11249. The fetch script obtained 42 driver-session telemetry payloads plus session, weather, timing, stint and race-control records. Extraction selects dry soft-tyre push laps using session timing and race control, excludes known deletions, and checks timing/identity and sector consistency. Whole-lap and sector windows are evaluated independently. Sector boundaries come from cumulative reported timing, with approximate alignment to the telemetry clock.

For each eligible window, estimate binary brake-active time divided by observed time. Use only documented states 0 and 100. Assign transitions to the midpoint of an observed bracket and retain conservative bounds conditional on the eligible intervals. Duplicate timestamps are handled before calculation. Require a maximum interpolated interval of 0.60 s, minimum median native cadence of 3 Hz and observed coverage of at least 97%. The median across passing laps produces each context row. Conditional bounds describe transition timing rather than population uncertainty. [OpenF1 API](https://openf1.org/docs/)

| Qualifying | Driver-session payloads | Candidate laps | Passing whole laps | Feature rows |
| --- | ---: | ---: | ---: | ---: |
| 2025 | 20 | 45 | 18 | 66 |
| 2026 | 22 | 55 | 3 | 29 |
| Total | 42 | 100 | 21 | 95 |

A total of 1,335 samples with an undocumented brake value in 2026 candidate windows were treated as missing. Uneven observability blocks year-to-year inference. Some sector rows are based on a single lap. No raw telemetry is shipped. See the processor for the exact selection and measurement procedure and its emitted diagnostics.
