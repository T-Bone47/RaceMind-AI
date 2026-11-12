#!/usr/bin/env python3
"""Build research dimensions and candidate style axes from explicit descriptions."""
import json
from pathlib import Path
from build_feature_dictionary import FEATURES

ROOT = Path(__file__).resolve().parents[1]
DIMENSIONS = [
    ("A", "braking", "braking_style", "Control and response during speed reduction.",
     "Onset timing and placement|Application aggressiveness and initial intensity|Command/pressure progression|Release|Trail braking|Brake/steer and brake/throttle overlap|Onset consistency|Braking in direction changes|Braking under lateral load|Straight versus combined phases|Low-grip modulation|Adaptation to tyre age|Lock-up indicators|Stability|Heavy stops versus flowing corners",
     "braking_onset_distance initial_brake_command brake_application_rate brake_release_duration trail_braking_fraction brake_steer_overlap brake_throttle_overlap braking_point_variability braking_lateral_load_share wet_brake_shift max_deceleration"),
    ("B", "steering", "steering_style", "Command timing, variability and vehicle response around a turn.",
     "Progression and rate|Smoothness|Turn-in timing and commitment|Correction frequency and magnitude|Reversals|Release/unwind|Front response preference|Rear stability preference|Tolerance of oversteer/understeer|Rotation phase|Steering feedback sensitivity|Reduced front grip adaptation",
     "steer_rate steer_rate_variability steering_smoothness turn_in_distance steer_correction_count steer_correction_magnitude steer_unwind_duration balance_response_proxy entry_rotation_fraction"),
    ("C", "corner_entry", "corner_entry_style", "Strategy from the approach through turn-in to the fixed apex gate.",
     "Entry speed|Braking depth and release relative to turn-in|Rotation|Front axle load|Turn-in timing|V/U line geometry|Early/late geometric apex|Stability and risk|Balance and chosen trajectory",
     "entry_speed braking_onset_distance braking_duration turn_in_distance entry_rotation_fraction trail_braking_fraction motion_stability"),
    ("D", "mid_corner", "mid_corner_style", "Strategy around the apex and sustained portion of the corner.",
     "Minimum speed|Steering demand|Geometric apex|Vehicle balance|Throttle carry|Coasting|Corrections|Aero load sensitivity|Speed-class differences|Line repeatability",
     "minimum_speed minimum_speed_ratio minimum_speed_position coasting_duration steer_correction_count motion_stability"),
    ("E", "corner_exit", "corner_exit_style", "Power application and vehicle response from apex to track-out and the next straight.",
     "Throttle onset/progression/full|Traction use and corrections|Rear slip management|Unwind|Exit speed and acceleration|Long-straight priority|Tyre-preserving application",
     "first_throttle_after_apex throttle_progression_rate throttle_50_distance throttle_95_distance throttle_oscillation_count steer_unwind_duration traction_slip_share exit_speed exit_acceleration following_straight_elapsed_time"),
    ("F", "high_speed", "high_speed_style", "Behaviour in the registered high-speed and high-aero regimes.",
     "Steering commitment|Lift versus flat|Minimum speed|Direction change speed retention|Aero balance|Instability sensitivity|Line precision|Adaptation",
     "throttle_lift_duration minimum_speed_ratio motion_stability steering_smoothness"),
    ("G", "low_speed", "low_speed_style", "Behaviour in tightly curved, traction- or mechanical-grip-sensitive segments.",
     "Hairpin rotation|Low-speed braking|Tight entry|Steering lock|Traction|Adaptability|Wheelspin management|Entry versus exit trade",
     "entry_rotation_fraction braking_onset_distance steer_rate traction_slip_share exit_acceleration minimum_speed_ratio"),
    ("H", "tyre_management", "tyre_management_style", "Technique changes and outcome during tyre conditioning and repeated laps.",
     "Slide avoidance|Front versus rear preservation|Warm-up|Thermal management|Long-stint changes|Pace versus degradation|Response to wear",
     "stint_degradation_slope motion_stability traction_slip_share context_adaptation_shift"),
    ("I", "wet_weather", "wet_weather_style", "Behaviour in independently verified wet or changing conditions.",
     "Brake and steering adaptation|Throttle modulation|Traction|Wet line|Grip exploration|Confidence in transitions",
     "wet_brake_shift context_adaptation_shift throttle_oscillation_count world_position"),
    ("J", "racecraft_and_adaptation", "adaptability", "Technique changes and tactical choices conditional on the driving task.",
     "Qualifying vs race|Traffic and dirty air|Overtaking|Defence|Starts|Tyre use while following|Setup changes|Regulation changes|Grip changes|Pressure",
     "traffic_entry_shift context_adaptation_shift stint_degradation_slope"),
    ("K", "errors", "error_patterns", "Observed incidents or recurring failure modes with validated labels and denominators.",
     "Lock-ups|Track limits|Over/under-rotation|Coasting|Traction loss|Corrections|Entry overspeed|Missed apex|Exit compromise|Lap variation|Pressure effects",
     "track_limits_incidents valid_invalid_window_delta lap_time_dispersion sideslip_proxy coasting_duration steer_correction_count"),
]

ARCHETYPES = [
    ("precision_stability", "Precision and stability orientation", "Consistent corner-relative input and line under repeated matched tasks. Pace and preferred balance are independent attributes.", "steering_smoothness motion_stability braking_point_variability", ["EV-PIA001"], "Piastri cited prior junior-category feedback. This is a hypothesis for feature design, with no numerical F1 fingerprint.", "Device filtering and a stable setup can produce similar traces."),
    ("entry_rotation", "Entry rotation", "Greater share of total heading change before the fixed apex, supported by yaw, path and input context.", "entry_rotation_fraction balance_response_proxy sideslip_proxy", ["EV-SEN002", "EV-ALO003"], "Senna and Alonso provide distinct, context-bound examples of yaw or trajectory strategies. Public yaw is unavailable at the required fidelity.", "A responsive front preference, transient oversteer or a sharp turn-in can occur independently."),
    ("brake_turn_overlap", "Brake and turn overlap", "Continuous spectrum from early brake release before turn-in to sustained overlap with declining command. Estimate in a fixed entry window.", "trail_braking_fraction brake_steer_overlap brake_release_duration", ["EV-NOR003", "EV-PIA002"], "The McLaren comparison motivates a relative axis under the MCL39 context. The two reports share a source.", "Heavy stops and linked bends demand different overlaps. Binary brake cannot reveal command release shape."),
    ("speed_retention", "Minimum-speed retention", "Higher minimum speed relative to matched approach in a fixed corner window, evaluated with downstream time and exit acceleration.", "minimum_speed_ratio minimum_speed_position corner_to_next_braking_delta", [], "Working measurement hypothesis. No general driver assignment.", "Vehicle grip and exit compromise can dominate. Minimum speed need not coincide with geometric apex."),
    ("entry_exit_tradeoff", "Entry and exit emphasis", "Jointly characterize time and speed over entry, apex, exit and next straight. Record entry and exit evidence independently.", "entry_to_apex_delta apex_to_exit_delta corner_to_next_braking_delta exit_acceleration", ["EV-MAS002", "EV-OCO001"], "Massa and Ocon described individual sequences where preparation for the following turn or straight affects line choice.", "A local time gain may reverse by the next braking zone. Energy deployment changes straight time."),
    ("traction_modulation", "Traction modulation", "Sustained throttle rise, corrective commands and simulated driven-axle slip within the same exit demand.", "throttle_progression_rate throttle_oscillation_count traction_slip_share", ["EV-VER003"], "One wet start and line analysis provides context, with no public numerical pedal or tyre-slip reference.", "Traction control, wet conditions, ERS and controller maps can change apparent smoothness."),
    ("context_adaptation", "Context-dependent adaptation", "Repeatable feature shifts across paired setup, grip or task conditions with adequate overlapping samples.", "context_adaptation_shift wet_brake_shift traffic_entry_shift", ["EV-ALO002", "EV-VER002", "EV-SAI003"], "Context and testimony can guide the matched conditions. Magnitude is undefined without controlled repeated observations.", "Sparse coverage cannot establish a mixed style. Team swaps bundle multiple causes."),
    ("high_speed_commitment", "High-speed commitment", "Relative speed retention and lift behaviour in a specific high-speed class at the same aero mode and grip.", "throttle_lift_duration minimum_speed_ratio motion_stability", ["EV-HAM003", "EV-LEC003", "EV-SAI004"], "Sources motivate circuit-conditional hypotheses about instability and long fast corners.", "Full throttle can be vehicle- or deployment-limited. Public throttle semantics need calibration."),
]
def write(name, data):
    (ROOT / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def main():
    evidence = json.loads((ROOT / "research" / "evidence.json").read_text(encoding="utf-8-sig"))
    by_id = {r["evidence_id"]: r for r in evidence}
    dimensions = []
    for identifier, name, trait_id, definition, questions, features in DIMENSIONS:
        codes = features.split()
        dimensions.append(dict(dimension_id=identifier, name=name, definition=definition,
                               profile_trait_id=trait_id, research_questions=questions.split("|"),
                               candidate_feature_ids=codes,
                               game_observability={code: FEATURES[code]["game_observability"] for code in codes},
                               public_compatibility={code: FEATURES[code]["real_f1_compatibility"] for code in codes},
                               evidence_scope="Use driver_evidence.csv and driver_style_profiles.json. An unanswered subquestion remains unknown."))
    write("driver_style_ontology.json", {"schema_version": "1.0.0", "dimensions": dimensions,
          "independent_context_fields": ["preferred_balance", "observed_balance", "adaptability", "racecraft", "strengths", "limitations"],
          "annotation_contract": ["value", "evidence_type", "evidence_ids", "applicable_context", "confidence", "missing_reason"]})
    archetypes = []
    for identifier, name, definition, features, ids, limitations, misleading in ARCHETYPES:
        archetypes.append(dict(archetype_id=identifier, name=name, operational_definition=definition,
                               game_feature_ids=features.split(), evidence_ids=ids,
                               examples=[{"driver_id": by_id[eid]["driver_id"], "evidence_id": eid, "season": by_id[eid]["season"]}
                                         for eid in ids], limitations=limitations, misleading_cases=misleading,
                               validation_status="unvalidated_continuous_axis"))
    write("driving_archetypes.json", {"schema_version": "1.0.0", "axes_are_nonexclusive": True,
        "candidate_changes": {"trail_braking_dominant_and_braking_turn_in_separated": "Opposite poles of brake_turn_overlap",
                              "entry_and_exit_prioritizing": "Coupled phase observations under entry_exit_tradeoff",
                              "adaptive_mixed": "Adaptive retained with paired evidence. Mixed dropped as a default assignment."},
        "archetypes": archetypes})

if __name__ == "__main__":
    main()
