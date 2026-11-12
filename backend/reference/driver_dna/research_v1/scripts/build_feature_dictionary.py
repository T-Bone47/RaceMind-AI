#!/usr/bin/env python3
"""Build the versioned feature dictionary and compatibility matrix."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EA = "EA_UDP_25_26"
OPEN = "OPENF1_DOCS"
FAST = "FASTF1_DATA"
FEATURES = {}

CHANNELS = {
    "t": "Game session time in seconds with session UID and unrewound frame counter; OpenF1 UTC parsed to relative seconds.",
    "s": "Metres along a versioned centerline, unwrapped. Game lap distance after coordinate validation; real public distance is estimated or supplied by a separately validated map.",
    "v": "Speed m/s; divide game and real km/h by 3.6.",
    "b": "Game normalized brake command [0,1].",
    "B": "Brake on/off; public 0/100 or bool; game B via 0.05-on/0.03-off hysteresis and 0.12 s persistence before downsampling.",
    "u": "Game normalized throttle [0,1]. Real public throttle signal is separately typed; never assumed equivalent to the game pedal.",
    "q": "Game normalized steering command [-1,1]; device, calibration, sensitivity, deadzone and assists metadata required for cross-player interpretation.",
    "gx": "Game longitudinal G along the documented convention; verify forward-acceleration sign on clean straight.",
    "gy": "Game lateral G; verify axes and signs on constant-direction corners.",
    "yaw": "Game heading/yaw radians, unwrap per continuous segment.",
    "yaw_rate": "Verified MotionEx yaw component rad/s, or differentiated yaw with source typed; validate axes per format.",
    "pose": "Game world position metres and forward/right basis; real public positions are approximate and need a separate scale, time alignment and map QA.",
    "wheel_slip": "Game MotionEx per-wheel slip ratio and slip angle, wheel order RL/RR/FL/FR; validate sign and units per game build before use.",
    "surface": "Game tyre surface categories, plus contact state where that field is available and version-verified. Categories alone do not establish contact.",
    "gear": "Integer engaged gear.",
    "lap": "Final lap time, game validity, completion, pit/flashback state, optional events and explicitly recorded intent.",
    "context": "Task, weather, layout, version, assists, device, setup, compound/age, traffic/flags and available energy-state metadata.",
    "reference": "Comparable player or approved cohort reference trace, with the same gates and preprocessing.",
}
POLICIES = {
    "kin": {"game_min_hz": 10, "public_min_hz": 3.0, "coverage": 0.95, "max_game_gap_s": 0.2, "max_public_gap_s": 0.6,
            "filter": "Derive from native valid samples. Linear interpolation inside valid continuous segments only. Recompute at matched native/public bandwidth when comparing domains; no interpolation of packet gaps larger than the limit."},
    "game_input": {"game_min_hz": 20, "public_min_hz": None, "coverage": 0.95, "max_game_gap_s": 0.125,
                   "filter": "Resample continuous variables at 20 Hz within clean segments; reflect-pad centered second-order seven-point Savitzky-Golay (0.35 s window) for derivatives; use hysteresis on unfiltered commands for discrete transitions."},
    "public_binary": {"game_min_hz": 20, "public_min_hz": 3.0, "coverage": 0.95, "max_game_gap_s": 0.125, "max_public_gap_s": 0.6,
                      "filter": "Sample game's debounced state using the public observation cadence for the comparison. Retain transition brackets (last off/first on etc.); use midpoint estimates and propagate the half-interval uncertainty. No smoothing or interpolation of binary state as pressure."},
    "aggregate": {"game_min_hz": None, "public_min_hz": None, "coverage": None,
                  "filter": "Accept only passing input rows with the same metric, preprocessing and context; group by session first; no numeric imputation."},
}

def metric(identifier, group, unit, formula, channels, policy, real, interpretation, confounders, failure="Required channel/gate missing or quality policy failed", kind="derived", notes=None):
    FEATURES[identifier] = {
        "feature_id": identifier, "group": group, "units": unit, "formula": formula,
        "required_channels": channels.split(), "quality_policy": policy,
        "real_f1_compatibility": real, "game_observability": kind, "interpretation": interpretation,
        "known_confounders": confounders, "failure_conditions": failure,
        "source_ids": [EA] + ([OPEN, FAST] if real != "not_currently_comparable" else []),
        "notes": notes,
    }

CAVEAT = "comparable_with_caveats"
DIRECT = "directly_comparable"
NONE = "not_currently_comparable"
QUAL = "qualitative_resemblance_only"
GATES = "Gate alignment, corner layout, grip, car, setup, load, assists and session task."
INPUT = "Device map, assists, setup, grip, trajectory, vehicle speed and driver intent."
RACE = "Fuel burn, car, aero, traffic, tyre compound and age, energy deployment, flags and grip evolution."
BRK = "Brake thresholds, sample cadence, alignment, gear/energy recovery, aero drag, grade and grip."
metric("braking_onset_distance", "braking", "m", "s(apex_gate)-s(t_B_on); positive before the fixed gate", "t s B", "public_binary", CAVEAT, "Relative brake onset; earlier means larger.", BRK, "No bracketed onset within predeclared entry window or apex gate unavailable")
metric("braking_onset_speed", "braking", "m/s", "v(t_B_on) from the onset bracket midpoint", "t v B", "public_binary", CAVEAT, "Speed at brake activation.", BRK)
metric("braking_duration", "braking", "s", "t_B_off-t_B_on for the declared main episode", "t B", "public_binary", CAVEAT, "Duration of sustained activation.", BRK, "Episode truncated, unbracketed, or merged across a missing-data interval")
metric("brake_activation_fraction", "braking", "fraction", "sum(dt with B=1)/sum(valid dt) over fixed window; use bracket midpoints", "t B", "public_binary", CAVEAT, "Coarse occupied time within a registered window.", BRK)
metric("initial_brake_command", "braking", "fraction", "max(b) from t_B_on through t_B_on+0.20 s", "t B b", "game_input", NONE, "Early game brake command magnitude.", INPUT)
metric("brake_application_rate", "braking", "fraction/s", "(0.80-0.20)*b_peak/(t_80_rise-t_20_rise)", "t b B", "game_input", NONE, "How quickly brake command builds.", INPUT, "Either crossing missing or crossing interval <0.10 s")
metric("brake_release_duration", "braking", "s", "t_20_fall-t_80_fall for sustained post-peak crossings of b_peak", "t b B", "game_input", NONE, "Duration of pressure-command release.", INPUT, "Non-unique release without a sustained crossing or insufficient resolution")
metric("max_deceleration", "braking", "m/s^2", "max(-a) in the brake episode; a is linear-fit slope of v on t in centered 1.0 s windows with >=4 native points", "t v B", "public_binary", CAVEAT, "Peak one-second velocity-derived deceleration.", BRK, "No full eligible 1 s window with at least four distinct native timestamps")
metric("mean_deceleration", "braking", "m/s^2", "(v(t_B_on)-v(t_B_off))/(t_B_off-t_B_on)", "t v B", "public_binary", CAVEAT, "Average net speed reduction, influenced by drag and grade.", BRK)
metric("trail_braking_fraction", "braking", "fraction", "T(B & t>=t_turn & t<=t_apex & 0.05<=b<=0.8*b_peak & db/dt<=0.05/s)/T(B) during main episode", "t s b B q", "game_input", NONE, "Proxy for releasing brake command while turning toward apex.", INPUT, kind="proxy")
metric("brake_steer_overlap", "braking", "fraction", "T(B & abs(q)>=0.08)/T(B) over entry", "t B q", "game_input", NONE, "Share of braking while steering is above threshold.", INPUT)
metric("brake_throttle_overlap", "braking", "fraction", "T(B & u>=0.05)/T(B)", "t B u", "game_input", NONE, "Game command overlap.", INPUT)
metric("braking_point_variability", "braking", "m", "1.4826*median(abs(d_i-median(d))) within matching corner/version and task", "reference context", "aggregate", CAVEAT, "Robust spread of onset distances.", BRK, "Fewer than 5 qualifying lap observations or measurement resolution exceeds spread")
metric("braking_consistency_by_class", "braking", "dimensionless", "median over eligible corners c of 1.4826*MAD(d_c)/declared_entry_length_c", "reference context", "aggregate", CAVEAT, "Relative onset dispersion across eligible corners in class.", BRK, "Fewer than 3 corners with at least 5 observations each")
metric("braking_lateral_load_share", "braking", "fraction", "T(B & abs(gy)>=0.5)/T(B) in entry", "t B gy", "game_input", NONE, "Braking while simulated lateral load is elevated.", INPUT)
metric("steer_rate", "steering", "fraction/s", "median(abs(dq/dt)) over active turn", "t q", "game_input", NONE, "Typical steering command rate.", INPUT)
metric("steer_rate_variability", "steering", "fraction/s", "1.4826*MAD(dq/dt) over active turn", "t q", "game_input", NONE, "Variability of steering command rate.", INPUT)
metric("turn_in_distance", "steering", "m", "s(apex_gate)-s(t_turn) with turn threshold sustained in corner direction for 0.15 s", "t s q", "game_input", QUAL, "Steering turn-in relative to fixed apex.", INPUT)
metric("steer_correction_count", "steering", "count", "Number of local counter-trend excursions in q from local extremum to extremum >=0.04 command, >=0.15 s duration, separated by >=0.20 s, within single-direction phase", "t q s", "game_input", NONE, "Discrete reversal proxy; planned transitions excluded by map and phase.", INPUT, "Missing planned turn direction or window too short", kind="proxy")
metric("steer_correction_magnitude", "steering", "fraction", "median(abs(q_end-q_start)) across qualifying correction excursions", "t q s", "game_input", NONE, "Median amplitude of detected reversals.", INPUT, "No qualifying events or unreliable detection", kind="proxy")
metric("steering_smoothness", "steering", "fraction/s^2", "sqrt(integral((d2q/dt2)^2 dt)/T) during registered single-direction turning interval", "t q", "game_input", QUAL, "Lower RMS command acceleration means smoother at the defined bandwidth.", INPUT)
metric("steer_unwind_duration", "steering", "s", "t_20_fall-t_80_fall on abs(q) relative to its registered corner peak after apex", "t q s", "game_input", NONE, "Time to unwind the steering command.", INPUT, "Crossings missing or an immediate next turn prevents unwind")
metric("steer_brake_overlap", "steering", "fraction", "T(abs(q)>=0.08 & B)/T(abs(q)>=0.08) in corner", "t q B", "game_input", NONE, "Share of active steering while braking.", INPUT)
metric("steer_throttle_overlap", "steering", "fraction", "T(abs(q)>=0.08 & u>=0.20)/T(abs(q)>=0.08) in corner", "t q u", "game_input", NONE, "Share of active steering with positive throttle command.", INPUT)
metric("steer_under_lateral_load", "steering", "fraction", "median(abs(q) | abs(gy) in the declared lateral-G band and v in matched speed band)", "t q gy v context", "game_input", NONE, "Command magnitude at comparable simulated loads.", INPUT)
metric("first_throttle_after_apex", "throttle", "m", "s(t_u_on)-s(apex_gate); first u crosses 0.05 after apex and persists 0.15 s", "t s u", "game_input", NONE, "Exit throttle onset distance; flag carry-through if throttle never turns off.", INPUT, "Carry-through, unbracketed crossing or no onset before exit")
metric("throttle_progression_rate", "throttle", "fraction/s", "0.70/(t_u85-t_u15) using first sustained exit crossings of 0.15 and 0.85", "t s u", "game_input", NONE, "Average rate of throttle build on exit.", INPUT, "Either crossing missing or interval <0.10 s")
metric("throttle_50_distance", "throttle", "m", "s(t_u50)-s(apex_gate), first sustained post-apex crossing", "t s u", "game_input", NONE, "Distance until 50% game command.", INPUT, "No bracketed 0.50 crossing")
metric("throttle_95_distance", "throttle", "m", "s(t_u95)-s(apex_gate), first sustained post-apex crossing", "t s u", "game_input", NONE, "Distance until 95% game command.", INPUT, "No bracketed 0.95 crossing")
metric("throttle_95_time", "throttle", "s", "t_u95-t_apex, first sustained post-apex crossing", "t s u", "game_input", NONE, "Time until 95% game command.", INPUT, "No bracketed 0.95 crossing")
metric("throttle_oscillation_count", "throttle", "count", "Count post-onset falls of u>=0.08 lasting >=0.15 s and recovered by >=0.08 within exit; refractory 0.20 s", "t s u", "game_input", NONE, "Repeated command corrections; traffic and deployment can motivate them.", INPUT, kind="proxy")
metric("throttle_lift_duration", "throttle", "s", "T(u<=0.85) for >=0.15 s contiguous runs in a declared fast-corner window", "t s u", "game_input", QUAL, "Extent of game throttle lifts.", INPUT)
metric("coasting_duration", "mid_corner", "s", "T(!B & u<0.05) within the predeclared apex phase", "t s B u", "game_input", NONE, "Command coasting time.", INPUT)
metric("exit_acceleration", "exit", "m/s^2", "(v(exit_gate)-v(apex_gate))/(t_exit-t_apex)", "t s v", "kin", CAVEAT, "Mean net exit acceleration.", GATES)
metric("traction_slip_share", "exit", "fraction", "T(u>=0.2 & max(driven_wheel_slip)>validated_threshold)/T(u>=0.2) from apex to exit; v>=8 m/s", "t s v u wheel_slip surface", "game_input", NONE, "Proxy for high driven-wheel longitudinal slip under power.", INPUT, "Unknown slip sign/scale, threshold, driven axle or contaminated surface", kind="proxy")
for name, gate in [("entry", "entry_gate"), ("exit", "exit_gate")]:
    metric(f"{name}_speed", name, "m/s", f"v({gate}) from bracketing valid samples", "t s v", "kin", CAVEAT, f"Speed at registered {name} gate.", GATES)
metric("minimum_speed", "apex", "m/s", "min(v) over fixed apex window after median filter of 3 native samples; harmonize sampling bandwidth", "t s v", "kin", CAVEAT, "Minimum speed in a registered window.", GATES)
metric("minimum_speed_ratio", "apex", "fraction", "minimum_speed/median(v in the declared approach reference window)", "t s v", "kin", CAVEAT, "Relative speed retained through the corner.", GATES, "Approach reference absent or median below 8 m/s")
metric("minimum_speed_position", "apex", "m", "s of first attaining the filtered minimum speed, minus s(apex_gate)", "t s v", "kin", CAVEAT, "Minimum-speed location relative to a fixed reference.", GATES, "Unstable or unresolvable location, clipped window or missing fixed gate")
for identifier, first, second in [
    ("corner_elapsed_time", "entry_gate", "exit_gate"), ("following_straight_elapsed_time", "exit_gate", "next_entry_gate"),
    ("braking_zone_delta", "approach_gate", "entry_gate"), ("entry_to_apex_delta", "entry_gate", "apex_gate"),
    ("apex_to_exit_delta", "apex_gate", "exit_gate"), ("corner_to_next_braking_delta", "entry_gate", "next_braking_reference_gate"),
    ("time_loss_distribution", "window_start_gate", "window_end_gate")]:
    delta = identifier.endswith("_delta") or identifier == "time_loss_distribution"
    formula = f"t({second})-t({first})" + (" minus reference elapsed time over identical gates" if delta else "")
    metric(identifier, "timing", "s", formula, "t s" + (" reference" if delta else ""), "kin", CAVEAT, "Positive delta means slower over the registered interval." if delta else "Elapsed time over fixed gates.", GATES)
metric("distance_aligned_time_delta", "timing", "s", "(t_player(s)-t_player(s0))-(t_ref(s)-t_ref(s0)) using monotone gate interpolation", "t s reference", "kin", CAVEAT, "Cumulative relative time to each distance sample.", GATES)
metric("official_sector_elapsed_time", "timing", "s", "Published sector duration or completed game sector time at confirmed equivalent timing lines", "lap context", "aggregate", DIRECT, "Direct timing observable; absolute comparison is performance context.", RACE)
metric("lap_elapsed_time", "timing", "s", "Official finished lap duration in seconds from result/timing source", "lap", "aggregate", DIRECT, "Valid lap elapsed time, independent of driving style.", RACE)
metric("sector_consistency", "consistency", "s", "1.4826*MAD(t_sector) across valid context-matched laps for each sector", "lap context", "aggregate", CAVEAT, "Robust sector-time dispersion.", RACE, "Fewer than 5 laps per cell")
metric("lap_time_dispersion", "consistency", "s", "1.4826*MAD(t_lap) over valid comparable laps", "lap context", "aggregate", CAVEAT, "Robust lap-time dispersion.", RACE, "Fewer than 5 laps per cell")
metric("track_limits_incidents", "errors", "count", "Count unique source-backed track-limit events by (session,lap,incident ID); preserve unknown reason", "lap context", "aggregate", CAVEAT, "Observed rule events under each domain's enforcement.", "Rule geometry, enforcement, event coverage, settings and scope.", "Source cannot distinguish invalidation reason or incident identity")
metric("valid_invalid_window_delta", "errors", "s", "median(window elapsed time in tagged exploration stratum) - median(in comparable valid baseline)", "lap context reference", "aggregate", NONE, "Exploration comparison; exclude portions after invalid shortcuts from pace conclusions.", RACE, "Fewer than 3 laps in either stratum, unknown intent, shortcut before comparison or incompatible paths")
metric("longitudinal_g", "dynamics", "g", "median(gx) over declared phase", "t gx", "game_input", NONE, "Direct game-simulated signed acceleration in g.", "Axis conventions, gradient, bumps and combined load.", kind="game_reported")
metric("lateral_g", "dynamics", "g", "median(abs(gy)) over declared phase", "t gy", "game_input", NONE, "Direct game-simulated lateral load magnitude.", "Banking, axis conventions, bumps and combined load.", kind="game_reported")
metric("heading", "dynamics", "rad", "unwrap(yaw(t)) relative to local map tangent where available", "t yaw pose", "game_input", NONE, "Game vehicle heading, or heading minus map tangent when explicitly normalized.", "Map convention and yaw wrapping.", kind="game_reported")
metric("yaw_rate", "rotation", "rad/s", "Use verified reported yaw_rate; otherwise d unwrap(yaw)/dt with source typed", "t yaw_rate", "game_input", NONE, "Angular rate about the verified yaw axis.", "Game basis, bank, spins and threshold choice.", kind="reported_or_derived")
metric("entry_rotation_fraction", "rotation", "fraction", "integral(abs(yaw_rate) dt, t_turn..t_apex)/integral(abs(yaw_rate) dt,t_turn..t_exit)", "t s q yaw_rate", "game_input", QUAL, "Share of yaw activity accrued before apex.", INPUT, "No stable turn onset or accumulated absolute yaw less than 0.05 rad", kind="proxy")
metric("world_position", "dynamics", "m", "Recorded world position x,y,z after explicit basis transform", "t pose", "kin", CAVEAT, "Registration input only; public pose has reduced precision.", "Coordinate conventions, world scale, different racing lines and topology.", kind="game_reported")
metric("vehicle_speed", "dynamics", "m/s", "v_kmh/3.6", "t v", "kin", DIRECT, "Same physical observable; absolute pace context.", RACE, kind="game_reported")
metric("wheel_slip_ratio", "dynamics", "fraction", "Reported per-wheel longitudinal slip ratio after verifying game build's sign and scale", "t wheel_slip v", "game_input", NONE, "Simulated tyre state.", "Low speeds, tyre radius, surface and ABS/TC interventions.", "Unverified scale/sign, low speed or invalid wheel stream", kind="game_reported")
metric("surface_contact", "dynamics", "category", "Per-wheel game surface/contact enum decoded by version; retain unknown values", "t surface", "game_input", NONE, "Surface context and, where available, explicit contact state.", "Packet format and surface classifications.", kind="game_reported")
metric("gear_changes", "dynamics", "count", "Count integer gear transitions stable across >=2 consecutive samples; skip gaps", "t gear", "kin", CAVEAT, "Number of reported changes at matched bandwidth.", "Automatic gears, vehicle ratios and source cadence.")
metric("motion_stability", "dynamics", "rad/s", "1.4826*MAD(yaw_rate - v*kappa_map) at matched speed and phase; kappa_map in 1/m", "t s v yaw_rate pose", "game_input", NONE, "Yaw residual dispersion; independent of actual tyre balance.", INPUT, "No validated curvature or poor registration", kind="proxy")
metric("sideslip_proxy", "dynamics", "rad", "atan2(dot(v_world,right_basis),dot(v_world,forward_basis)) in road plane; v>=8 m/s", "t v pose", "game_input", NONE, "Direction of motion relative to heading.", "Banking, map basis, yaw reversals, velocity noise and game build.", "No independent reliable velocity/basis or speed below threshold", kind="proxy")
metric("balance_response_proxy", "rotation", "rad/s", "median(yaw_rate-v*kappa_ref) in matched turn phase, conditional on speed, q, lateral load and sideslip/wheel-slip evidence", "t s v q gy yaw_rate pose wheel_slip", "game_input", QUAL, "Observed response in a controlled game run; preference requires repeated choices or explicit statement.", INPUT, "No matched reference or independent motion/slip confirmation", kind="proxy")
metric("stint_degradation_slope", "tyre_management", "s/lap", "Theil-Sen median pairwise slope of lap-time residual against tyre age within one matched stint", "lap context reference", "aggregate", CAVEAT, "Pace residual change with tyre age; confounding can dominate.", RACE, "Fewer than 8 valid comparable laps, missing baseline or overlapping strategy changes")
metric("context_adaptation_shift", "adaptability", "normalized units", "median(z_feature in condition B)-median(z_feature in condition A), within paired layout/task/vehicle/device groups", "context reference", "aggregate", CAVEAT, "Observed change between declared conditions; sign is metric-specific.", RACE, "No adequately populated overlapping paired strata")
metric("wet_brake_shift", "wet_weather", "m", "median(d_B_on in wet)-median(d_B_on in dry) in paired compatible corner and task strata", "context reference", "aggregate", CAVEAT, "Earlier/later activation difference with wet grip.", BRK, "No verified wet and dry matched cells")
metric("traffic_entry_shift", "racecraft", "m", "median(d_B_on with declared close-traffic classification)-median(d_B_on in clean air)", "context reference", "aggregate", CAVEAT, "Observed entry change in a declared traffic condition; outside core DNA.", RACE, "No validated traffic series or insufficient matched lap counts")

def main():
    dictionary = {
        "schema_version": "1.0.0",
        "definitions": {"T(predicate)": "Integral of a Boolean predicate over eligible time. Return null if the denominator is zero.",
                        "MAD": "Median absolute deviation about the sample median.",
                        "gates": "Approach/entry, apex, exit and next braking reference are fixed for each circuit/version/corner; map or empirically register them on a held-out reference; never use player minimum speed to define the apex gate.",
                        "t_turn": "First sign-correct abs(q)>=0.08 crossing in entry held for 0.15 s; adaptive noise floor may only be substituted through a new preprocessing version.",
                        "sustained": "0.15 s unless a feature specifies another threshold; 0.03 hysteresis for throttle-on off state; retain crossing bracket.",
                        "coverage": "Fraction of registered analysis interval supported by eligible interpolation brackets. Check rate from median spacing on native packets and max gap before interpolation.",
                        "bounds": "Null if gate missing, flashback/pit crosses window, active validity unsuitable for requested analysis, denominator undefined, or values exceed the observable dynamic range."},
        "channels": CHANNELS, "quality_policies": POLICIES, "features": list(FEATURES.values()),
    }
    (ROOT / "telemetry_feature_dictionary.json").write_text(json.dumps(dictionary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    columns = ["feature_id", "group", "units", "real_f1_compatibility", "game_observability", "required_channels", "known_confounders", "source_ids"]
    with (ROOT / "real_f1_game_compatibility.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in FEATURES.values():
            writer.writerow({**row, "required_channels": "|".join(row["required_channels"]), "source_ids": "|".join(row["source_ids"])})

if __name__ == "__main__":
    main()
