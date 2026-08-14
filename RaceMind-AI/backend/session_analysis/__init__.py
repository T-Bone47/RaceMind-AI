"""Session analysis: lap/sector comparison, stint (tyre wear) analysis,
fuel/pace trends across a session, incident detection, personal bests,
and a composite session score. session_score.analyze_session() is the
single pipeline entry point - see that module for how the pieces below
compose into one SessionReport.
"""

from session_analysis.models import SessionReport, SessionScore
from session_analysis.session_score import analyze_session

__all__ = ["analyze_session", "SessionReport", "SessionScore"]
