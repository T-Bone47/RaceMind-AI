"""Logging setup.

Called once from the FastAPI lifespan on startup. Uses the standard
library's dictConfig rather than pulling in a third-party structured
logging dependency - one less thing to break, and it's enough to give
every log line a consistent, greppable shape.
"""

from __future__ import annotations

import logging.config

from config.context import request_id_var


class RequestIdFilter(logging.Filter):
    """Injects request_id into every log record."""
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


def configure_logging(level: str = "INFO") -> None:
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {
                "request_id": {
                    "()": RequestIdFilter,
                }
            },
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)-8s | %(name)s | [req=%(request_id)s] %(message)s",
                    "datefmt": "%Y-%m-%dT%H:%M:%S%z",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "stream": "ext://sys.stdout",
                    "filters": ["request_id"],
                },
            },
            "root": {
                "handlers": ["console"],
                "level": level.upper(),
            },
            "loggers": {
                "uvicorn": {"level": level.upper(), "handlers": ["console"], "propagate": False},
                "uvicorn.access": {"level": level.upper(), "handlers": ["console"], "propagate": False},
                "sqlalchemy.engine": {"level": "WARNING", "handlers": ["console"], "propagate": False},
            },
        }
    )
