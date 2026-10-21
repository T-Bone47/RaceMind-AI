"""ORM models.

Import every model module here so relationship() string references
resolve and Alembic's autogenerate / `Base.metadata.create_all` see the
full schema regardless of which module happens to be imported first.
"""

from database.models.circuit_setup import CircuitSetup
from database.models.driver_profile import DriverProfile
from database.models.fuel import FuelLog
from database.models.lap import Lap
from database.models.session import RaceSession
from database.models.strategy import StrategyPlan
from database.models.telemetry import TelemetryFrameRecord
from database.models.tyre import TyreStint
from database.models.user import User

__all__ = [
    "User",
    "RaceSession",
    "Lap",
    "TyreStint",
    "FuelLog",
    "StrategyPlan",
    "DriverProfile",
    "TelemetryFrameRecord",
    "CircuitSetup",
]
