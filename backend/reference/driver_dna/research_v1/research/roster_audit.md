# Roster and circuit metadata audit

Research cutoff 12 November 2026, Asia/Kolkata. The 2026 snapshot contains 20 completed Grands Prix through São Paulo on 8 November. The announced 22-driver opening lineup expanded to 25 actual starters. Ryo Hirakawa started for Haas in Mexico City, Rafael Câmara started for Haas in São Paulo, and Yuki Tsunoda started for Racing Bulls at Zandvoort, Monza and Madrid while Liam Lawson drove for Red Bull in place of Isack Hadjar. Standings often show one team per driver, so constructor membership comes from race classifications. [2026 race results](https://www.formula1.com/en/results/2026/races) · [2026 standings](https://www.formula1.com/en/results/2026/drivers) · [Lawson and Tsunoda substitutions](https://www.formula1.com/en/latest/article/hadjar-to-make-racing-return-with-red-bull-at-azerbaijan-gp.1ddPnUSDEze0V9MCiQ9d2U.1ddPnUSDEze0V9MCiQ9d2U) · [Hirakawa race classification](https://www.formula1.com/en/results/2026/races/1298/mexico/race-result) · [São Paulo FIA final classification](https://api.fia.com/system/files/decision-document/2026_sao_paulo_grand_prix_-_final_race_classification.pdf)

## Scope and cross-checks

| Season | Distinct Grand Prix starters |
| --- | ---: |
| 2014 | 24 |
| 2015 | 21 |
| 2016 | 24 |
| 2017 | 25 |
| 2018 | 20 |
| 2019 | 20 |
| 2020 | 23 |
| 2021 | 21 |
| 2022 | 22 |
| 2023 | 22 |
| 2024 | 24 |
| 2025 | 21 |
| 2026 through São Paulo | 25 |

The union has 65 drivers. The roster contains 38 Priority A drivers who started in 2021–2026, 27 Priority B drivers who last started in 2014–2020, and 25 selected pre-2014 Priority C drivers. The broader World Championship index contains 794 historical starters from 1,169 race classifications, including the Indianapolis 500 when it counted as a World Championship round. Historic entry and result coverage follows F1DB. [Pinned F1DB release](https://github.com/f1db/f1db/releases/tag/v2026.20.0)

The driver set for every 2014–2026 season was cross-checked against the official standings. Three starts absent from the season standings were confirmed with official race results. André Lotterer started at Spa in 2014, Jenson Button started at Monaco in 2017, and Paul di Resta started at the Hungaroring in 2017. Isack Hadjar's 2025 Melbourne formation-lap accident is classified as DNS in the FIA and Formula 1 records, so his 2025 start count is 23. The F1DB season aggregate reports 24. Two other F1DB aggregate mismatches are outside the modern window. John Watson and Manfred Winkelhock each have a 1983 DNQ that the event-based filter excludes. They still qualify for the historical index. [2014 Belgian GP race result](https://www.formula1.com/en/results/2014/races/909/belgium/race-result) · [2017 Monaco GP race result](https://www.formula1.com/en/results/2017/races/964/monaco/race-result) · [2017 Hungarian GP race result](https://www.formula1.com/en/results/2017/races/969/hungary/race-result) · [2025 Hadjar driver results](https://www.formula1.com/en/results/2025/drivers/ISAHAD01/isack-hadjar)

`start_year` and `last_start_year` are observed World Championship start years. `end_year` is the last observed start year for a driver with no 2026 starts and null for 2026 participants. It makes no claim about retirement, reserve roles or contract status. Practice, sprint, qualifying-only and DNS records do not qualify a driver. A zero-lap DNF can qualify as a race start, for example an opening-lap retirement. `season_context.teams` records the constructor, exact entrant names when the entrant/round join exists, and possible chassis models from the team season pool. The chassis field represents the season candidate pool even for a single-model record. It carries no setup or chassis serial detail.

The circuit catalogue contains 40 layouts observed in completed Grands Prix from 2014 through the cutoff. The release layout IDs distinguish changes such as Barcelona's chicane configuration and Yas Marina's revisions. For a layout with multiple observed lengths, event lengths are preserved as a list. These are real-world reference lengths. RaceMind needs game layout IDs and independently verified corner gates for any telemetry alignment. The F1DB Suzuka version used in 2026 is `suzuka-2`, 5,807 m and 18 turns.

## Reproduction

Run `python scripts/build_roster.py` from the package directory. The extractor checks the SHA-256 of the pinned F1DB ZIP. Supply `--archive PATH` for a previously downloaded identical copy, and `--output PATH` to generate in a separate directory. It emits only normalized metadata. The release ZIP and official classification tables are not included in this package.

Attribution for generated roster, historical index and layout metadata goes to F1DB contributors, release v2026.20.0, under CC BY 4.0. RaceMind selected eligible classifications, joined identity, constructor and chassis tables, grouped by driver and season, assigned local IDs and converted layout lengths to metres. The official records above were used for verification. [Source release](https://github.com/f1db/f1db/releases/tag/v2026.20.0) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
