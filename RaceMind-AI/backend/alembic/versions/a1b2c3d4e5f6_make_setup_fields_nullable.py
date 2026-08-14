"""make engine_braking ballast fuel_load nullable

Revision ID: a1b2c3d4e5f6
Revises: 3cc7839e6024
Create Date: 2026-08-11 03:25:00.000000

These three columns on circuit_setups were NOT NULL with defaults of 0/0.0,
but the XLSX community import source doesn't provide them. Making them
nullable lets us honestly represent "not provided" as NULL rather than
misrepresenting it as "the real value is zero."

Existing rows that already have real values (e.g. RaceMind baselines)
are unaffected — their values stay as-is. New imports that don't provide
these fields will correctly have NULL.
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "3cc7839e6024"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "circuit_setups", "engine_braking",
        existing_type=sa.Integer(),
        nullable=True,
        existing_server_default=sa.text("0"),
        server_default=None,
    )
    op.alter_column(
        "circuit_setups", "ballast",
        existing_type=sa.Integer(),
        nullable=True,
        existing_server_default=sa.text("0"),
        server_default=None,
    )
    op.alter_column(
        "circuit_setups", "fuel_load",
        existing_type=sa.Float(),
        nullable=True,
        existing_server_default=sa.text("0.0"),
        server_default=None,
    )


def downgrade() -> None:
    # Restore NOT NULL with defaults, converting any NULLs to 0/0.0 first.
    op.execute("UPDATE circuit_setups SET engine_braking = 0 WHERE engine_braking IS NULL")
    op.execute("UPDATE circuit_setups SET ballast = 0 WHERE ballast IS NULL")
    op.execute("UPDATE circuit_setups SET fuel_load = 0.0 WHERE fuel_load IS NULL")

    op.alter_column(
        "circuit_setups", "engine_braking",
        existing_type=sa.Integer(),
        nullable=False,
        server_default=sa.text("0"),
    )
    op.alter_column(
        "circuit_setups", "ballast",
        existing_type=sa.Integer(),
        nullable=False,
        server_default=sa.text("0"),
    )
    op.alter_column(
        "circuit_setups", "fuel_load",
        existing_type=sa.Float(),
        nullable=False,
        server_default=sa.text("0.0"),
    )
