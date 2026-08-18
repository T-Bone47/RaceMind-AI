"""Context variables for propagating request-scoped state across the application."""

from __future__ import annotations

import contextvars

# Stores the unique request ID for the current execution context.
request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="unknown")
