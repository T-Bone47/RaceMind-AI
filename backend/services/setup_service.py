from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from database.models.circuit_setup import CircuitSetup
from database.models.enums import (
    SessionType,
    SetupInputDevice,
    SetupSkillLevel,
    SetupSource,
    SetupWeather,
)
from database.repositories.circuit_setup_repository import CircuitSetupRepository
from setups.importers.base import SetupImporter, SetupImportRecord
from setups.recommender import NoSetupAvailableError, SetupRecommendation, SetupRecommender
from telemetry.models import GameTitle


class SetupService:
    def __init__(self, repository: CircuitSetupRepository) -> None:
        self.repository = repository
        self.recommender = SetupRecommender(repository)

    async def recommend(
        self,
        *,
        game: GameTitle,
        track_name: str,
        session_type: SessionType,
        weather: SetupWeather,
        input_device: SetupInputDevice,
        skill_level: SetupSkillLevel,
    ) -> SetupRecommendation:
        try:
            return await self.recommender.recommend(
                game=game,
                track_name=track_name,
                session_type=session_type,
                weather=weather,
                input_device=input_device,
                skill_level=skill_level,
            )
        except NoSetupAvailableError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    async def list_for_track(self, game: GameTitle, track_name: str) -> list[CircuitSetup]:
        return await self.repository.list_for_track(game, track_name)

    async def list_all(self) -> list[CircuitSetup]:
        return await self.repository.list_all(limit=1000)

    async def create_user_setup(self, user_id: uuid.UUID, **fields: object) -> CircuitSetup:
        setup = CircuitSetup(
            source=SetupSource.USER_CREATED,
            created_by_user_id=user_id,
            **fields,
        )
        return await self.repository.create(setup)

    async def get_owned(self, setup_id: uuid.UUID, user_id: uuid.UUID) -> CircuitSetup:
        setup = await self.repository.get(setup_id)
        if setup is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setup not found")
        if setup.created_by_user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your setup")
        return setup

    async def delete_owned(self, setup_id: uuid.UUID, user_id: uuid.UUID) -> None:
        setup = await self.get_owned(setup_id, user_id)
        await self.repository.delete(setup)

    async def import_from(
        self,
        importer: SetupImporter,
        game: GameTitle,
        track_name: str,
        *,
        source: SetupSource = SetupSource.COMMUNITY_IMPORT,
    ) -> list[CircuitSetup]:
        """Runs one SetupImporter and persists whatever it returns,
        tagged with its source_name for traceability. `source` defaults
        to COMMUNITY_IMPORT for external sources; pass
        SetupSource.OFFICIAL_BASELINE explicitly for RaceMind AI's own
        SeedDataImporter - it isn't a third-party import and shouldn't
        be tagged as one. Returns an empty list - not an error - if the
        importer has nothing for this track, since "no data available"
        is a normal, expected outcome for a community source, not a
        failure."""
        records = await importer.fetch(game, track_name)
        created: list[CircuitSetup] = []
        for record in records:
            setup = CircuitSetup(
                source=source,
                source_attribution=record.source_attribution or importer.source_name,
                **_record_to_fields(record),
            )
            created.append(await self.repository.create(setup))
        return created


def _record_to_fields(record: SetupImportRecord) -> dict[str, object]:
    fields = record.__dict__.copy()
    fields.pop("source_attribution", None)
    return fields
