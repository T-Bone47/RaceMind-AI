"""Declarative base shared by every ORM model.

The naming convention matters more than it looks: without it, SQLAlchemy
lets the database auto-name constraints (postgres does this differently
than sqlite), which means Alembic's autogenerate produces a different
migration depending on which backend you ran it against. Fixing the
convention here makes migrations deterministic across environments.
"""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
