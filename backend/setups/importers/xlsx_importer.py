"""XLSX importer for Matt212 community controller setups.

Parses the Matt212_Setups.xlsx workbook (4 sheets: F1 26, F1 25,
F1 25 Wet, F2 25) and produces SetupImportRecord instances that go
through the same import pipeline as any other SetupImporter.

Every value emitted by this importer is traceable to a specific cell
in the source workbook, with documented data-quality fixes for known
issues (comma decimals, stray characters, missing slash separators).
No values are invented or inferred.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path

from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupWeather,
)
from setups.importers.base import SetupImportRecord
from telemetry.models import GameTitle

logger = logging.getLogger(__name__)

# --- Sheet-to-domain mapping ---

_SOURCE_ATTRIBUTION = (
    "Matt212 Community Setups "
    "(controller-oriented, per author description)"
)


@dataclass(frozen=True)
class _SheetConfig:
    """Maps a worksheet name to the game/weather domain dimensions."""

    game: GameTitle
    weather: SetupWeather
    has_strategy_columns: bool  # F1 26/F1 25 dry sheets have 4 extra link columns


_SHEET_MAP: dict[str, _SheetConfig] = {
    "F1 26": _SheetConfig(
        game=GameTitle.F1_25_2026_DLC, weather=SetupWeather.DRY, has_strategy_columns=True,
    ),
    "F1 25": _SheetConfig(
        game=GameTitle.F1_25, weather=SetupWeather.DRY, has_strategy_columns=True,
    ),
    "F1 25 Wet": _SheetConfig(
        game=GameTitle.F1_25, weather=SetupWeather.WET, has_strategy_columns=False,
    ),
    "F2 25": _SheetConfig(
        game=GameTitle.F2_25, weather=SetupWeather.DRY, has_strategy_columns=False,
    ),
}


# --- Cell parsing helpers ---

# Regex to strip non-numeric trailing characters from integers (e.g. "22c" → "22")
_INT_CLEANUP_RE = re.compile(r"^(-?\d+)[a-zA-Z]+$")

# Regex to strip a trailing % sign
_PERCENT_RE = re.compile(r"^\s*(-?\d+(?:\.\d+)?)\s*%?\s*$")


def _parse_float(raw: str) -> float:
    """Parse a float value, handling European comma decimals and source typos.

    Known data-quality issues in the XLSX:
      - ``'-.3.50'`` (stray dot after negative sign) → ``-3.50``
      - ``'-2..00'`` (double dot) → ``-2.00``
    """
    cleaned = raw.strip().replace(",", ".")

    # Fix double-dot typo: "-2..00" → "-2.00"
    while ".." in cleaned:
        cleaned = cleaned.replace("..", ".")

    # Fix stray dot after negative sign: "-.3.50" → "-3.50"
    if cleaned.startswith("-.") and cleaned.count(".") > 1:
        # Remove the stray leading dot: "-.3.50" → "-3.50"
        cleaned = "-" + cleaned[2:]
        logger.warning("Fixed stray dot after negative sign: %r → %s", raw, cleaned)

    return float(cleaned)


def _parse_int(raw: str) -> int:
    """Parse an integer value, handling stray trailing characters."""
    cleaned = raw.strip()
    m = _INT_CLEANUP_RE.match(cleaned)
    if m:
        logger.warning("Stripped non-numeric suffix from %r → %s", raw, m.group(1))
        return int(m.group(1))
    return int(cleaned)


def _parse_percent_int(raw: str) -> int:
    """Parse a percentage string like '55%' or '100%' into an integer 0-100."""
    m = _PERCENT_RE.match(raw)
    if m:
        return int(float(m.group(1)))
    # Fallback: try direct int parse
    return int(raw.strip())


def _split_slash(cell_value: str, expected_count: int) -> list[str]:
    """Split a slash-separated cell value, handling missing-slash data quality issues.

    Some cells in the source XLSX have a missing slash separator
    (e.g. '24.7 / 24.7 22.5 / 22.5' instead of '24.7 / 24.7 / 22.5 / 22.5').
    When the slash count doesn't yield the expected number of parts, fall back
    to whitespace splitting.
    """
    parts = [p.strip() for p in cell_value.split("/")]
    if len(parts) == expected_count:
        return parts

    # Fallback: split on whitespace, filter empty
    ws_parts = [p.strip() for p in cell_value.replace("/", " ").split() if p.strip()]
    if len(ws_parts) == expected_count:
        logger.warning(
            "Slash-split gave %d parts (expected %d) for %r; "
            "fell back to whitespace split",
            len(parts), expected_count, cell_value,
        )
        return ws_parts

    raise ValueError(
        f"Cannot parse {cell_value!r}: expected {expected_count} values, "
        f"got {len(parts)} (slash) / {len(ws_parts)} (whitespace)"
    )


# --- Row parsing ---

@dataclass(frozen=True)
class _ParseWarning:
    """A non-fatal data-quality issue encountered during parsing."""

    track: str
    sheet: str
    field: str
    message: str


def _parse_aero(cell: str) -> tuple[int, int]:
    """Parse 'front_wing / rear_wing' from the Aerodynamics column."""
    parts = _split_slash(cell, 2)
    return _parse_int(parts[0]), _parse_int(parts[1])


def _parse_transmission(cell: str) -> tuple[int, int]:
    """Parse 'diff_on_throttle / diff_off_throttle' from the Transmission column."""
    parts = _split_slash(cell, 2)
    return _parse_percent_int(parts[0]), _parse_percent_int(parts[1])


def _parse_suspension_geometry(cell: str) -> tuple[float, float, float, float]:
    """Parse 'front_camber / rear_camber / front_toe / rear_toe'."""
    parts = _split_slash(cell, 4)
    return (
        _parse_float(parts[0]),  # front_camber
        _parse_float(parts[1]),  # rear_camber
        _parse_float(parts[2]),  # front_toe
        _parse_float(parts[3]),  # rear_toe
    )


def _parse_suspension(cell: str) -> tuple[int, int, int, int, int, int]:
    """Parse 'front_susp / rear_susp / front_arb / rear_arb / front_rh / rear_rh'.

    The Suspension column packs 6 values:
    front_suspension / rear_suspension / front_anti_roll_bar /
    rear_anti_roll_bar / front_ride_height / rear_ride_height
    """
    parts = _split_slash(cell, 6)
    return (
        _parse_int(parts[0]),  # front_suspension
        _parse_int(parts[1]),  # rear_suspension
        _parse_int(parts[2]),  # front_anti_roll_bar
        _parse_int(parts[3]),  # rear_anti_roll_bar
        _parse_int(parts[4]),  # front_ride_height
        _parse_int(parts[5]),  # rear_ride_height
    )


def _parse_brakes(cell: str) -> tuple[int, int]:
    """Parse 'brake_bias / brake_pressure' from the Brakes column.

    Note: the XLSX format is 'bias% / pressure%', which is the reverse
    of what you might expect. The first value is brake_bias and the
    second is brake_pressure, matching the in-game display order.
    """
    parts = _split_slash(cell, 2)
    return _parse_percent_int(parts[0]), _parse_percent_int(parts[1])


def _parse_tyres(cell: str) -> tuple[float, float, float, float]:
    """Parse 'FL / FR / RL / RR' tyre pressures in PSI."""
    parts = _split_slash(cell, 4)
    return (
        _parse_float(parts[0]),  # FL
        _parse_float(parts[1]),  # FR
        _parse_float(parts[2]),  # RL
        _parse_float(parts[3]),  # RR
    )


def _extract_notes_and_links(
    row: tuple[object, ...],
    config: _SheetConfig,
) -> tuple[str | None, str | None, str | None]:
    """Extract reference-link columns into separate fields and a structured notes string."""
    parts: list[str] = []
    
    track_guide_url: str | None = None
    race_strategy_notes: str | None = None

    # Column indices depend on whether strategy columns exist.
    # Headers: Track(0), Aero(1), Trans(2), SuspGeom(3), Susp(4), Brakes(5), Tyres(6)
    # With strategy cols: TrackGuide(7), RaceStrategy(8), ShortFormat(9), RawHotlap(10)
    # Without strategy cols: TrackGuide(7)

    track_guide = row[7] if len(row) > 7 else None
    if track_guide:
        track_guide_url = str(track_guide)

    if config.has_strategy_columns:
        race_strategy = row[8] if len(row) > 8 else None
        short_format = row[9] if len(row) > 9 else None
        raw_hotlap = row[10] if len(row) > 10 else None

        if race_strategy:
            race_strategy_notes = str(race_strategy)
        if short_format:
            parts.append(f"Short Format: {short_format}")
        if raw_hotlap:
            parts.append(f"Raw Hotlap: {raw_hotlap}")

    notes = "\n".join(parts) if parts else None
    return notes, track_guide_url, race_strategy_notes


def _parse_row(
    row: tuple[object, ...],
    config: _SheetConfig,
    sheet_name: str,
) -> tuple[SetupImportRecord | None, list[_ParseWarning]]:
    """Parse one data row into a SetupImportRecord.

    Returns (record, warnings). record is None if the row is empty or unparseable.
    """
    warnings: list[_ParseWarning] = []
    track_name = row[0]
    if track_name is None:
        return None, warnings

    track_name = str(track_name).strip()

    try:
        front_wing, rear_wing = _parse_aero(str(row[1]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Aerodynamics for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Aerodynamics", str(exc))]

    try:
        diff_on_throttle, diff_off_throttle = _parse_transmission(str(row[2]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Transmission for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Transmission", str(exc))]

    try:
        front_camber, rear_camber, front_toe, rear_toe = _parse_suspension_geometry(str(row[3]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Suspension Geometry for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Suspension Geometry", str(exc))]

    # Flag positive rear_camber values as a data-quality concern
    if rear_camber > 0:
        warnings.append(_ParseWarning(
            track_name, sheet_name, "rear_camber",
            f"Positive rear_camber {rear_camber} imported as-is "
            f"(likely a missing negative sign in source data)",
        ))

    try:
        (front_suspension, rear_suspension,
         front_anti_roll_bar, rear_anti_roll_bar,
         front_ride_height, rear_ride_height) = _parse_suspension(str(row[4]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Suspension for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Suspension", str(exc))]

    try:
        brake_bias, brake_pressure = _parse_brakes(str(row[5]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Brakes for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Brakes", str(exc))]

    try:
        tyre_fl, tyre_fr, tyre_rl, tyre_rr = _parse_tyres(str(row[6]))
    except (ValueError, IndexError) as exc:
        logger.error("Cannot parse Tyres for %s (%s): %s", track_name, sheet_name, exc)
        return None, [_ParseWarning(track_name, sheet_name, "Tyres", str(exc))]

    notes, track_guide_url, strategy_notes = _extract_notes_and_links(row, config)

    record = SetupImportRecord(
        game=config.game,
        track_name=track_name,
        session_type=SessionType.RACE,
        weather=config.weather,
        input_device=SetupInputDevice.CONTROLLER,
        skill_level=SetupSkillLevel.ALL_LEVELS,
        name=f"{track_name} - {config.game.value.upper().replace('_', ' ')} "
             f"{'Wet ' if config.weather == SetupWeather.WET else ''}Setup",
        front_wing=front_wing,
        rear_wing=rear_wing,
        diff_on_throttle=diff_on_throttle,
        diff_off_throttle=diff_off_throttle,
        front_camber=front_camber,
        rear_camber=rear_camber,
        front_toe=front_toe,
        rear_toe=rear_toe,
        front_suspension=front_suspension,
        rear_suspension=rear_suspension,
        front_anti_roll_bar=front_anti_roll_bar,
        rear_anti_roll_bar=rear_anti_roll_bar,
        front_ride_height=front_ride_height,
        rear_ride_height=rear_ride_height,
        brake_pressure=brake_pressure,
        brake_bias=brake_bias,
        tyre_pressure_fl=tyre_fl,
        tyre_pressure_fr=tyre_fr,
        tyre_pressure_rl=tyre_rl,
        tyre_pressure_rr=tyre_rr,
        notes=notes,
        track_guide_video_url=track_guide_url,
        race_strategy_notes=strategy_notes,
        source_attribution=_SOURCE_ATTRIBUTION,
    )
    return record, warnings


# --- Public importer class ---

class XlsxSetupImporter:
    """Imports setups from the Matt212 community XLSX workbook.

    Implements the SetupImporter protocol. Unlike the SeedDataImporter
    which generates records from code, this reads real external data
    from a file — but the output shape (SetupImportRecord) and the
    import flow (via SetupService.import_from) are identical.
    """

    source_name = "matt212_xlsx"

    def __init__(self, xlsx_path: str | Path) -> None:
        self._path = Path(xlsx_path)
        self._records: dict[tuple[GameTitle, str], list[SetupImportRecord]] | None = None
        self._warnings: list[_ParseWarning] = []

    def _ensure_loaded(self) -> None:
        """Lazy-load and parse the workbook on first access."""
        if self._records is not None:
            return

        try:
            import openpyxl
        except ImportError as exc:
            raise ImportError(
                "openpyxl is required for XLSX setup import. "
                "Install it with: pip install openpyxl"
            ) from exc

        self._records = {}
        self._warnings = []

        wb = openpyxl.load_workbook(str(self._path), read_only=True, data_only=True)
        try:
            for sheet_name, config in _SHEET_MAP.items():
                if sheet_name not in wb.sheetnames:
                    logger.warning("Sheet %r not found in workbook", sheet_name)
                    continue

                ws = wb[sheet_name]

                # Find the header row (the row containing "Track")
                header_row_idx: int | None = None
                for row_idx, row in enumerate(ws.iter_rows(min_row=1, max_row=10, values_only=True), 1):
                    if row and row[0] == "Track":
                        header_row_idx = row_idx
                        break

                if header_row_idx is None:
                    logger.warning("No header row found in sheet %r", sheet_name)
                    continue

                # Parse data rows (starting after the header)
                for row in ws.iter_rows(min_row=header_row_idx + 1, values_only=True):
                    if row[0] is None:
                        continue

                    record, row_warnings = _parse_row(row, config, sheet_name)
                    self._warnings.extend(row_warnings)

                    if record is not None:
                        key = (record.game, record.track_name)
                        self._records.setdefault(key, []).append(record)
        finally:
            wb.close()

        total = sum(len(v) for v in self._records.values())
        logger.info(
            "Loaded %d setups from %s (%d warnings)",
            total, self._path.name, len(self._warnings),
        )

    async def fetch(
        self, game: GameTitle, track_name: str,
    ) -> list[SetupImportRecord]:
        """Returns setups for the given game/track from the XLSX data."""
        self._ensure_loaded()
        assert self._records is not None
        return list(self._records.get((game, track_name), []))

    async def fetch_all(self) -> list[SetupImportRecord]:
        """Returns all parsed setups from the workbook.

        Not part of the SetupImporter protocol — this is a convenience
        method for bulk import scripts.
        """
        self._ensure_loaded()
        assert self._records is not None
        all_records: list[SetupImportRecord] = []
        for records in self._records.values():
            all_records.extend(records)
        return all_records

    @property
    def warnings(self) -> list[_ParseWarning]:
        """Data-quality warnings from the most recent parse."""
        self._ensure_loaded()
        return list(self._warnings)
