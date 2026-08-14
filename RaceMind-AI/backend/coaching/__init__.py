"""AI Driver Coach: detects corners from telemetry signal alone (no
track map needed - see corner_detection.py), analyzes braking/throttle/
steering per corner, scores lap-time consistency, and gives tyre
preservation advice. coach.py's DriverCoach is the single pipeline
entry point.
"""

from coaching.coach import DriverCoach
from coaching.models import CoachingReport, CornerCoachingTip, TelemetrySample
from coaching.tyre_preservation import TyreWearSnapshot

__all__ = ["DriverCoach", "CoachingReport", "CornerCoachingTip", "TelemetrySample", "TyreWearSnapshot"]
