"""Real-world F1 reference data via FastF1, used to benchmark live/game
session data against actual historical F1 sessions - the "complete
package" comparison (pace, sectors, tyre choices) rather than treating
the AI Engineer's numbers as the only frame of reference.

Everything here reads from FastF1's live-timing/Ergast-compatible APIs
over the network. It's a separate concern from `telemetry/` (which
normalizes live UDP/replay data) and `strategy/` (which reasons about
the current session) - this module answers "how does this compare to
the real thing", not "what should I do right now".
"""
