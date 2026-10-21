"""Tests for the XLSX setup importer and the updated recommender fallback.

Tests are split into:
1. Unit tests for cell-parsing helpers (no I/O)
2. Integration tests for the full XlsxSetupImporter against the real XLSX
3. Database-level tests for the import → recommender pipeline
4. Updated recommender test for ALL_LEVELS fallback
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import pytest

from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from setups.importers.base import SetupImportRecord
from setups.importers.xlsx_importer import (
    _parse_aero,
    _parse_brakes,
    _parse_float,
    _parse_int,
    _parse_percent_int,
    _parse_suspension,
    _parse_suspension_geometry,
    _parse_transmission,
    _parse_tyres,
    _split_slash,
)
from telemetry.models import GameTitle

# =====================================================================
# 1. Cell-parsing unit tests
# =====================================================================


class TestParseFloat:
    def test_standard_float(self) -> None:
        assert _parse_float("23.5") == 23.5

    def test_negative_float(self) -> None:
        assert _parse_float("-3.40") == -3.40

    def test_european_comma_decimal(self) -> None:
        assert _parse_float("25,5") == 25.5

    def test_with_whitespace(self) -> None:
        assert _parse_float("  21.5 ") == 21.5

    def test_stray_dot_after_negative(self) -> None:
        """XLSX data quality: '-.3.50' should parse as -3.50."""
        assert _parse_float("-.3.50") == -3.50

    def test_double_dot(self) -> None:
        """XLSX data quality: '-2..00' should parse as -2.00."""
        assert _parse_float("-2..00") == -2.00


class TestParseInt:
    def test_standard_int(self) -> None:
        assert _parse_int("42") == 42

    def test_with_stray_character(self) -> None:
        assert _parse_int("22c") == 22

    def test_negative_int(self) -> None:
        assert _parse_int("-5") == -5

    def test_with_whitespace(self) -> None:
        assert _parse_int(" 10 ") == 10


class TestParsePercentInt:
    def test_with_percent_sign(self) -> None:
        assert _parse_percent_int("55%") == 55

    def test_without_percent_sign(self) -> None:
        assert _parse_percent_int("100") == 100

    def test_with_whitespace(self) -> None:
        assert _parse_percent_int(" 99% ") == 99


class TestSplitSlash:
    def test_normal_slash_split(self) -> None:
        assert _split_slash("21 / 17", 2) == ["21", "17"]

    def test_four_values(self) -> None:
        result = _split_slash("24.5 / 24.5 / 22.0 / 22.0", 4)
        assert result == ["24.5", "24.5", "22.0", "22.0"]

    def test_missing_slash_fallback(self) -> None:
        """The Las Vegas / Austria Reverse data quality issue: missing slash."""
        result = _split_slash("24.7 / 24.7 22.5 / 22.5", 4)
        assert result == ["24.7", "24.7", "22.5", "22.5"]

    def test_six_values(self) -> None:
        result = _split_slash("34 / 9 / 9 / 14 / 21 / 47", 6)
        assert result == ["34", "9", "9", "14", "21", "47"]

    def test_raises_on_wrong_count(self) -> None:
        with pytest.raises(ValueError, match="Cannot parse"):
            _split_slash("1 / 2 / 3", 5)


class TestParseAero:
    def test_standard(self) -> None:
        fw, rw = _parse_aero("21 / 17")
        assert fw == 21
        assert rw == 17

    def test_with_space_before_slash(self) -> None:
        fw, rw = _parse_aero("24 /16")
        assert fw == 24
        assert rw == 16


class TestParseTransmission:
    def test_standard(self) -> None:
        on, off = _parse_transmission("100% / 25%")
        assert on == 100
        assert off == 25

    def test_without_percent(self) -> None:
        on, off = _parse_transmission("95 / 50")
        assert on == 95
        assert off == 50


class TestParseSuspensionGeometry:
    def test_standard_negative_values(self) -> None:
        fc, rc, ft, rt = _parse_suspension_geometry("-3.40 / -1.90 / 0.02 / 0.13")
        assert fc == -3.40
        assert rc == -1.90
        assert ft == 0.02
        assert rt == 0.13

    def test_positive_rear_camber(self) -> None:
        """The F2 25 Bahrain data quality issue: positive rear_camber."""
        fc, rc, ft, rt = _parse_suspension_geometry("-3.50 / 2.00 / 0.00 / 0.10")
        assert fc == -3.50
        assert rc == 2.00  # imported as-is, not negated
        assert ft == 0.00
        assert rt == 0.10


class TestParseSuspension:
    def test_six_values(self) -> None:
        fs, rs, farb, rarb, frh, rrh = _parse_suspension("34 / 9 / 9 / 14 / 21 / 47")
        assert fs == 34
        assert rs == 9
        assert farb == 9
        assert rarb == 14
        assert frh == 21
        assert rrh == 47

    def test_with_stray_character(self) -> None:
        """The F1 25 Netherlands Reverse issue: '22c' in suspension."""
        fs, rs, farb, rarb, frh, rrh = _parse_suspension("35 / 5 / 8 / 15 / 22c / 50")
        assert frh == 22  # 'c' stripped


class TestParseBrakes:
    def test_standard(self) -> None:
        bias, pressure = _parse_brakes("55% / 100%")
        assert bias == 55
        assert pressure == 100

    def test_without_percent(self) -> None:
        bias, pressure = _parse_brakes("56 / 99")
        assert bias == 56
        assert pressure == 99


class TestParseTyres:
    def test_standard(self) -> None:
        fl, fr, rl, rr = _parse_tyres("24.5 / 24.5 / 22.0 / 22.0")
        assert fl == 24.5
        assert fr == 24.5
        assert rl == 22.0
        assert rr == 22.0

    def test_missing_slash(self) -> None:
        """Las Vegas data quality issue."""
        fl, fr, rl, rr = _parse_tyres("24.7 / 24.7 22.5 / 22.5")
        assert fl == 24.7
        assert fr == 24.7
        assert rl == 22.5
        assert rr == 22.5

    def test_european_comma(self) -> None:
        """Netherlands Wet data quality issue."""
        fl, fr, rl, rr = _parse_tyres("25,5 / 25.5 / 23.3 / 23.3")
        assert fl == 25.5
        assert fr == 25.5
        assert rl == 23.3
        assert rr == 23.3


# =====================================================================
# 2. Integration tests against the real XLSX
# =====================================================================

# These tests run against the actual XLSX file. They're skipped if the file
# doesn't exist (e.g., in CI where only source code is available).

_XLSX_CANDIDATES = [
    Path(r"c:\Users\olive\Downloads\Matt212 Setups.xlsx"),
    Path(os.environ.get("MATT212_XLSX_PATH", "")),
]

_XLSX_PATH: Path | None = None
for _p in _XLSX_CANDIDATES:
    if _p.is_file():
        _XLSX_PATH = _p
        break

_skip_no_xlsx = pytest.mark.skipif(
    _XLSX_PATH is None,
    reason="Matt212 XLSX file not found — set MATT212_XLSX_PATH or place it in Downloads",
)


@_skip_no_xlsx
class TestXlsxImporterIntegration:
    """Integration tests that load the real XLSX file."""

    @pytest.fixture
    def importer(self):
        from setups.importers.xlsx_importer import XlsxSetupImporter
        return XlsxSetupImporter(_XLSX_PATH)

    async def test_loads_all_four_sheets(self, importer) -> None:
        all_records = await importer.fetch_all()
        # F1 26: 28, F1 25: 27, F1 25 Wet: 27, F2 25: 27 = 109 total
        assert len(all_records) == 109

    async def test_f1_26_game_title(self, importer) -> None:
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Australia")
        assert len(records) == 1
        assert records[0].game == GameTitle.F1_25_2026_DLC

    async def test_f1_25_game_title(self, importer) -> None:
        records = await importer.fetch(GameTitle.F1_25, "Australia")
        # Two: dry + wet
        assert len(records) == 2
        games = {r.game for r in records}
        assert games == {GameTitle.F1_25}

    async def test_f1_25_wet_weather(self, importer) -> None:
        records = await importer.fetch(GameTitle.F1_25, "Australia")
        weathers = {r.weather for r in records}
        assert SetupWeather.WET in weathers

    async def test_f2_25_game_title(self, importer) -> None:
        records = await importer.fetch(GameTitle.F2_25, "Australia")
        assert len(records) == 1
        assert records[0].game == GameTitle.F2_25

    async def test_all_setups_are_controller(self, importer) -> None:
        all_records = await importer.fetch_all()
        for r in all_records:
            assert r.input_device == SetupInputDevice.CONTROLLER

    async def test_all_setups_are_all_levels(self, importer) -> None:
        all_records = await importer.fetch_all()
        for r in all_records:
            assert r.skill_level == SetupSkillLevel.ALL_LEVELS

    async def test_all_setups_are_race_session(self, importer) -> None:
        all_records = await importer.fetch_all()
        for r in all_records:
            assert r.session_type == SessionType.RACE

    async def test_source_attribution(self, importer) -> None:
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Monaco")
        assert records[0].source_attribution is not None
        assert "Matt212" in records[0].source_attribution

    async def test_engine_braking_is_none(self, importer) -> None:
        """XLSX doesn't provide engine braking — must be None, not 0."""
        all_records = await importer.fetch_all()
        for r in all_records:
            assert r.engine_braking is None

    async def test_ballast_and_fuel_are_none(self, importer) -> None:
        """XLSX doesn't provide ballast/fuel — must be None, not 0."""
        all_records = await importer.fetch_all()
        for r in all_records:
            assert r.ballast is None
            assert r.fuel_load is None

    async def test_spot_check_australia_f1_26(self, importer) -> None:
        """Verify a single setup against the known XLSX values."""
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Australia")
        r = records[0]
        assert r.front_wing == 21
        assert r.rear_wing == 17
        assert r.diff_on_throttle == 100
        assert r.diff_off_throttle == 25
        assert r.front_camber == -3.40
        assert r.rear_camber == -1.90
        assert r.front_toe == 0.02
        assert r.rear_toe == 0.13
        assert r.front_suspension == 34
        assert r.rear_suspension == 9
        assert r.front_anti_roll_bar == 9
        assert r.rear_anti_roll_bar == 14
        assert r.front_ride_height == 21
        assert r.rear_ride_height == 47
        assert r.brake_bias == 55
        assert r.brake_pressure == 100
        assert r.tyre_pressure_fl == 24.5
        assert r.tyre_pressure_fr == 24.5
        assert r.tyre_pressure_rl == 22.0
        assert r.tyre_pressure_rr == 22.0

    async def test_notes_contain_track_guide(self, importer) -> None:
        """F1 26/25 dry sheets have reference link columns → track_guide_video_url."""
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Australia")
        assert records[0].track_guide_video_url is not None
        assert "http" in records[0].track_guide_video_url or records[0].track_guide_video_url != ""

    async def test_notes_contain_race_strategy(self, importer) -> None:
        """F1 26/25 dry sheets include Race Strategy 50% → race_strategy_notes."""
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Australia")
        assert records[0].race_strategy_notes is not None

    async def test_wet_sheet_no_strategy_columns(self, importer) -> None:
        """Wet and F2 sheets should only have Track Guide, no strategy."""
        records = await importer.fetch(GameTitle.F1_25, "Australia")
        wet_records = [r for r in records if r.weather == SetupWeather.WET]
        assert len(wet_records) == 1
        assert wet_records[0].race_strategy_notes is None

    async def test_data_quality_las_vegas_f1_26(self, importer) -> None:
        """Las Vegas F1 26 has a missing-slash tyres cell."""
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Las Vegas (USA)")
        r = records[0]
        assert r.tyre_pressure_fl == 24.7
        assert r.tyre_pressure_fr == 24.7
        assert r.tyre_pressure_rl == 22.5
        assert r.tyre_pressure_rr == 22.5

    async def test_data_quality_netherlands_wet_comma(self, importer) -> None:
        """Netherlands Wet has a comma decimal."""
        records = await importer.fetch(GameTitle.F1_25, "Netherlands")
        wet = [r for r in records if r.weather == SetupWeather.WET]
        assert len(wet) == 1
        assert wet[0].tyre_pressure_fl == 25.5

    async def test_data_quality_netherlands_reverse_stray_char(self, importer) -> None:
        """Netherlands Reverse F1 25 has '22c' in suspension."""
        records = await importer.fetch(GameTitle.F1_25, "Netherlands Reverse")
        r = records[0]
        assert r.front_ride_height == 22

    async def test_data_quality_bahrain_f2_positive_camber(self, importer) -> None:
        """F2 25 Bahrain has a positive rear_camber (likely missing negative sign)."""
        records = await importer.fetch(GameTitle.F2_25, "Bahrain")
        r = records[0]
        assert r.rear_camber == 2.00  # imported as-is

    async def test_warnings_include_positive_camber(self, importer) -> None:
        """Parser should warn about positive rear_camber values."""
        _ = await importer.fetch_all()  # trigger parse
        camber_warnings = [w for w in importer.warnings if w.field == "rear_camber"]
        assert len(camber_warnings) >= 1

    async def test_fetch_nonexistent_track(self, importer) -> None:
        """Fetching a track that doesn't exist returns an empty list."""
        records = await importer.fetch(GameTitle.F1_25_2026_DLC, "Nonexistent Track")
        assert records == []


# =====================================================================
# 3. Database-level import pipeline test
# =====================================================================


class TestXlsxImportPipeline:
    """Tests the import → DB → recommender pipeline using synthetic data."""

    def _make_record(self, **overrides: Any) -> SetupImportRecord:
        defaults: dict[str, Any] = dict(
            game=GameTitle.F1_25_2026_DLC,
            track_name="Australia",
            session_type=SessionType.RACE,
            weather=SetupWeather.DRY,
            input_device=SetupInputDevice.CONTROLLER,
            skill_level=SetupSkillLevel.ALL_LEVELS,
            name="Australia - F1 26 Setup",
            front_wing=21,
            rear_wing=17,
            diff_on_throttle=100,
            diff_off_throttle=25,
            front_camber=-3.40,
            rear_camber=-1.90,
            front_toe=0.02,
            rear_toe=0.13,
            front_suspension=34,
            rear_suspension=9,
            front_anti_roll_bar=9,
            rear_anti_roll_bar=14,
            front_ride_height=21,
            rear_ride_height=47,
            brake_pressure=100,
            brake_bias=55,
            tyre_pressure_fl=24.5,
            tyre_pressure_fr=24.5,
            tyre_pressure_rl=22.0,
            tyre_pressure_rr=22.0,
            source_attribution="Matt212 Community Setups (controller-oriented)",
        )
        defaults.update(overrides)
        return SetupImportRecord(**defaults)

    async def test_import_creates_setup_in_db(self, db_session) -> None:
        from database.repositories.circuit_setup_repository import CircuitSetupRepository
        from services.setup_service import SetupService

        class _FakeImporter:
            source_name = "test_xlsx"

            def __init__(self, records: list[SetupImportRecord]) -> None:
                self._records = records

            async def fetch(self, game: GameTitle, track_name: str) -> list[SetupImportRecord]:
                return [r for r in self._records if r.game == game and r.track_name == track_name]

        record = self._make_record()
        importer = _FakeImporter([record])

        repo = CircuitSetupRepository(db_session)
        service = SetupService(repo)
        created = await service.import_from(
            importer, GameTitle.F1_25_2026_DLC, "Australia",
            source=SetupSource.COMMUNITY_IMPORT,
        )

        assert len(created) == 1
        setup = created[0]
        assert setup.source == SetupSource.COMMUNITY_IMPORT
        assert setup.front_wing == 21
        assert setup.rear_wing == 17
        assert setup.engine_braking is None
        assert setup.ballast is None
        assert setup.fuel_load is None
        assert setup.skill_level == SetupSkillLevel.ALL_LEVELS
        assert setup.input_device == SetupInputDevice.CONTROLLER

    async def test_imported_setup_found_by_recommender(self, db_session) -> None:
        """An ALL_LEVELS setup should be found by the recommender when
        searching for a specific skill level."""
        from database.models.circuit_setup import CircuitSetup
        from database.repositories.circuit_setup_repository import CircuitSetupRepository
        from setups.recommender import SetupRecommender

        setup = CircuitSetup(
            game=GameTitle.F1_25_2026_DLC,
            track_name="Australia",
            session_type=SessionType.RACE,
            weather=SetupWeather.DRY,
            input_device=SetupInputDevice.CONTROLLER,
            skill_level=SetupSkillLevel.ALL_LEVELS,
            source=SetupSource.COMMUNITY_IMPORT,
            name="Australia - F1 26 Setup",
            front_wing=21, rear_wing=17,
            diff_on_throttle=100, diff_off_throttle=25,
            front_camber=-3.40, rear_camber=-1.90,
            front_toe=0.02, rear_toe=0.13,
            front_suspension=34, rear_suspension=9,
            front_anti_roll_bar=9, rear_anti_roll_bar=14,
            front_ride_height=21, rear_ride_height=47,
            brake_pressure=100, brake_bias=55,
            tyre_pressure_fl=24.5, tyre_pressure_fr=24.5,
            tyre_pressure_rl=22.0, tyre_pressure_rr=22.0,
        )
        repo = CircuitSetupRepository(db_session)
        await repo.create(setup)

        recommender = SetupRecommender(repo)
        result = await recommender.recommend(
            game=GameTitle.F1_25_2026_DLC,
            track_name="Australia",
            session_type=SessionType.RACE,
            weather=SetupWeather.DRY,
            input_device=SetupInputDevice.CONTROLLER,
            skill_level=SetupSkillLevel.INTERMEDIATE,  # requesting INTERMEDIATE
        )

        # Should find the ALL_LEVELS setup via fallback
        assert not result.is_exact_match
        assert result.setup.skill_level == SetupSkillLevel.ALL_LEVELS
        assert result.fallback_reason is not None
        assert "all_levels" in result.fallback_reason
