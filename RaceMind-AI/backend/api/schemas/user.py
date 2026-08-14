from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from api.schemas.common import ORMBase


class UserRead(ORMBase):
    id: uuid.UUID
    email: str
    display_name: str
    is_active: bool
    created_at: datetime


class UserUpdate(ORMBase):
    display_name: str | None = Field(default=None, min_length=1, max_length=100)
