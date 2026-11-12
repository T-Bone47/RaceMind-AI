# Feature engineering methodology

## Capture and alignment

Keep session UID, game and UDP versions, participant identity, frame counter, game session clock and source receive timestamp. Treat receive time as a diagnostic. Join packets first by UID and unrewound frame, then use a nearest-time join within half the slower nominal period where needed. Resolve out-of-order or exact duplicate records before joins. Mask conflicting duplicates and gaps. Flashbacks begin a new continuity segment. Never join a rewound branch, pit route or adjacent lap through an interpolation gap. Track effective Hz separately for each channel. Convert speed to m/s, preserve game commands in documented ranges, and calibrate motion basis, sign and slip units on straight and constant-direction runs. Device maps and assists are required context for input-derived comparisons. [EA UDP documentation](https://forums.ea.com/blog/f1-games-game-info-hub-en/ea-sports%E2%84%A2-f1%C2%AE25-2026-season-pack-udp-specification/12187347)

Register player lap distance to fixed versioned gates. Check wraparound and monotonicity, finish and sector residuals, and map-projection continuity. Constrain world-position projection by forward heading and prior segment, especially at Suzuka's crossover. Register gates independently of the compared traces. Keep signed uncertainty per gate and invalidate segments crossing ambiguous projections. Speed integration is a distance estimate and needs drift checks against known anchors. Public car and position clocks require explicit alignment checks. Timing-sector markers provide coarse windows even when reliable corner gates are missing. [FastF1 timing cautions](https://github.com/theOehrly/Fast-F1/blob/main/docs/data_reference/time_explanation.rst)

```text
Approach gate → entry gate → fixed apex gate → exit gate → next braking reference
                        ↳ turn-in and brake release are independently observed events
```

## Calculation and aggregation

The machine-readable dictionary defines units, channels, formulae, native sample rates, smoothing and failure behaviour. For signed extrema or thresholds, restrict the search to the registered phase and retain the original bracket. Select the main brake episode by greatest speed reduction within the fixed entry window. A tied or unbracketed episode is unknown. Distinguish threshold absence on a complete trace from threshold unobservability. Baseline source choice and algorithm parameters are versioned. The centered seven-point derivative filter is an initial engineering choice. Check phase-boundary sensitivity and the effect of unfiltered versus filtered commands before promoting a feature. [Savitzky–Golay method](https://doi.org/10.1021/ac60214a047)

Each observation carries domain, build, layout, task, tyre, grip, traffic, aero/energy context where available, car/setup, device, assists, sample count, windows, source, and uncertainty. Aggregate repeat laps to a median by driver-session-corner-context first. Aggregate sessions with equal independent session weighting. Keep per-session robust spread and stratify each condition with adequate support. Propagate interval and gate uncertainty by resampling feasible brackets and re-running feature extraction.

A fixed apex and a minimum-speed point can differ. Compare gains through the following straight, including energy and aero configuration, before interpreting the faster line. Use player-to-player-baseline deltas for coaching. High steering input alone cannot diagnose balance. For controlled comparisons, combine steering command, speed, yaw response, lateral acceleration, independently derived sideslip or wheel-slip and matched trajectory. Preference additionally requires setup choice evidence or direct reporting. [Vehicle dynamics reference](https://doi.org/10.4271/942538)

## Quality gates

Retain per-channel quality, availability and derived/observed status. Invalidate windows with phase clipping, insufficient samples, unsupported device/version semantics, unsigned motion axes or denominator zero. Compare across domains only at the common validated bandwidth and with compatible semantics. Public throttle documentation describes an engine-related signal. Treat mapping to game pedal as unresolved. Preserve binary brake transition brackets. Use source-specific noise floors and cadence gates. Wet weather, long stints, traffic, invalid exploration and pressure-related observations use separate strata.

For same-domain comparisons, player coaching requires repeated paired windows and a compatible player baseline. Rank evidence separately from absolute pace or driver skill. Causal claims about gains require a matched intervention, such as repeated A/B runs changing one technique while controlling setup and conditions.
