"""Bulk-import Matt212 XLSX setups into the RaceMind AI database.

Usage:
    cd backend
    python -m scripts.import_xlsx_setups /path/to/Matt212_Setups.xlsx

Requires:
    - openpyxl (pip install openpyxl)
    - A configured DATABASE_URL environment variable (or defaults to the
      dev database from config/settings.py)

This script uses the same import pipeline as any other SetupImporter:
    XlsxSetupImporter → SetupService.import_from() → CircuitSetupRepository

Every created CircuitSetup is tagged with:
    source = COMMUNITY_IMPORT
    source_attribution = "Matt212 Community Setups (...)"
"""

from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

# Ensure backend/ is on sys.path when run as `python -m scripts.import_xlsx_setups`
_backend_root = Path(__file__).resolve().parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))

from database.models.enums import SetupSource  # noqa: E402
from database.repositories.circuit_setup_repository import CircuitSetupRepository  # noqa: E402
from database.session import AsyncSessionLocal  # noqa: E402
from services.setup_service import SetupService  # noqa: E402
from setups.importers.xlsx_importer import XlsxSetupImporter  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


async def main(xlsx_path: str) -> None:
    importer = XlsxSetupImporter(xlsx_path)

    # Pre-load and report what was parsed
    all_records = await importer.fetch_all()
    logger.info("Parsed %d total setups from XLSX", len(all_records))

    if importer.warnings:
        logger.warning("Data-quality warnings during parse:")
        for w in importer.warnings:
            logger.warning("  [%s / %s] %s: %s", w.sheet, w.track, w.field, w.message)

    # Group by game for reporting
    by_game: dict[str, int] = {}
    for r in all_records:
        key = f"{r.game.value} / {r.weather.value}"
        by_game[key] = by_game.get(key, 0) + 1

    for key, count in sorted(by_game.items()):
        logger.info("  %s: %d setups", key, count)

    # Import into database
    async with AsyncSessionLocal() as session:
        repo = CircuitSetupRepository(session)
        service = SetupService(repo)

        created_count = 0
        for record in all_records:
            setups = await service.import_from(
                importer,
                record.game,
                record.track_name,
                source=SetupSource.COMMUNITY_IMPORT,
            )
            created_count += len(setups)

        await session.commit()
        logger.info("Successfully imported %d setups into the database", created_count)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.import_xlsx_setups <xlsx_path>", file=sys.stderr)
        sys.exit(1)

    asyncio.run(main(sys.argv[1]))
