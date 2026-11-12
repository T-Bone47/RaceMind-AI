# Driver matching model specification

## Eligibility and scoring

Create player and professional vectors with a shared feature version, unit and measurement semantics. Each cell represents one feature family × task × corner class and registered layout context. Keep weather, vehicle generation, tyre, setup, assists, device and timing quality in the conditioning key. Pool only where a cross-context effect is measured and bounded. Keep preference, observed mechanics and performance outcomes as distinct payloads. Keep racecraft, tyre and wet-weather outputs conditional on enough evidence in their own task.

Normalize within each domain and predeclared context using an independent cohort: z = (x − cohort median) / max(1.4826 × cohort MAD, measurement resolution floor). Fit cohorts only in training folds. Bridge domains via a held-out simulator crossover and verified monotonicity or calibration mappings. Absolute lap time, famous status and size of evidence corpus carry zero ranking weight.

Use weighted robust distance over a common comparison mask. A candidate first passes a minimum overlap gate on a feature set frozen before ranking. Compare the remaining candidates on their shared cells. If this common set is too sparse, abstain or return an explicitly unresolved ordering. Cap each feature family's total weight so correlated metrics such as brake duration and brake occupancy do not receive duplicate influence.

```text
r_i = (z_player,i − z_driver,i) / sqrt(1 + u_player,i² + u_driver,i² + u_bridge,i²)
L(r) = 0.5 r² if |r| ≤ 1.5, else 1.5 × (|r| − 0.75)
D = sum(w_i L(r_i)) / sum(w_i)
coverage = sum(eligible planned weights) / sum(planned weights)
```

Higher uncertainty may shrink residuals, so exclude cells with excessive uncertainty before ranking and audit rank under increased uncertainty. Start with equal family budgets and equal weights within a family. Calibrate distance and margin on holdouts. Output ordinal ranking and support, with no percentage likeness or probability unless prospectively calibrated. Give evidence-backed explanations using signed standardized differences, uncertainty and original feature units.

## Confidence and abstention

Provisional engineering gates for testing are at least 5 eligible laps in each player context, 2 independent player sessions and 3 professional sessions at 2 circuits, at least 3 independently informative families, and at least 60% of planned weight on comparable cells. The cross-domain bridge, production rights and feature eligibility are independent requirements. These counts are hypotheses to validate, with stricter cutoffs if precision remains poor.

Bootstrap whole sessions within each source and perturb brackets, thresholds, weights and bridge estimates. Assess top-two rank stability and margin against a practical resolution threshold derived from repeat sessions. A proposed starting threshold is primary support in at least 80% of valid bootstrap draws with a held-out stable margin. This is a resampling diagnostic. Insufficient data returns `insufficient_evidence`. Candidates with adequate evidence but unstable ordering return `ambiguous`. Missing or invalid reference pack returns `reference_unavailable`. Return a second candidate only if it independently passes eligibility and its ordering is supported. Evaluate distance on the same reference population and task before publishing a result.

Qualitative claims have a parallel evidence trail. Use expert annotations only where a source explicitly scopes a directional claim and an independent reviewer can reproduce the label. Compare game feature direction or observed phase to that claim under compatible conditions. Return `qualitative_resemblance` as an explanation with provenance and competing evidence. Use no inferred numeric magnitude, and give qualitative evidence zero effect on v1 numeric ranking. A self-report preference can inform coaching questions without inferring a matching setup from a telemetry proxy.

## Alternative models and evaluation

| Model | Role |
| --- | --- |
| Weighted absolute or Huber distance | Primary interpretable baseline. Compare both for sensitivity. |
| Masked cosine | Secondary benchmark. Similar directions can hide amplitude differences and small shared masks inflate similarity. |
| Covariance-aware distance | Research option after enough independent contexts to estimate shrinkage covariance. |
| Continuous style axes | Summarize player mechanics and evidence. Require measured correspondence before ranking drivers on them. |
| Context-conditioned distance | Required comparison structure. Test transfer only after paired evidence. |
| Bayesian hierarchical model | Later option for uncertainty and partial pooling, with prior sensitivity and calibration checks. |
| Learned metric | Consider only with repeated multi-domain data and independent labels. Compare to the interpretable baseline under identical splits. |
| Hybrid evidence and numeric | Use the numeric branch for rank and the evidence branch for contextual interpretation. |

Split by whole weekend and circuit, then by car/team, season and person where the question requires generalization. Compare within-driver repeatability to between-driver separation, report false-match and abstention rates by support band and assess coverage of the rank set. Test deliberate missingness, rain, update drift and downsampling. Run label permutations at session block level. Audit equal-coverage subsets, team-balanced pairs, device/assist groups and exclusion of high-profile sessions. Blind reviewers to identity during technique coding. No player-style truth labels or cross-domain calibration data are included in this release. [Bootstrap reference](https://doi.org/10.1214/aos/1176344552)

## Suzuka example · illustrative

Ingest all four laps under the same session and build identity. Preserve the game final validity bit, reason events if present and player-marked exploration intent in separate fields. Confirm the supplied 1:32.495 as personal best only if a complete valid lap actually records 92,495 ms. Compare the two valid traces against the best valid trace using independently registered gates. Keep the two exploratory laps as a separate stratum, comparing pre-incident approach and control traces while masking time gained through shortcuts. A validity flag alone leaves cause unknown.

With the supplied summary, emit `insufficient_evidence`, with primary and secondary matches both null. Report only the supplied count and best observed time. A practical next objective is to capture repeated valid approaches through T11 and the final chicane, then examine onset, release, speed retention and downstream exit time. The recommendation is a data-collection exercise, with no assertion that either corner cost time. Actual output needs synchronized packet streams for speed, brake, steering, throttle, distance, lap validity, time and motion, plus setup, device, assists, task, weather and exploration tags. [Illustrative API response](integration_specification.md)
