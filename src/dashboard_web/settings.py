from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


@dataclass(slots=True)
class DashboardSettings:
    firebase_credentials_path: str
    firebase_collections: list[str]
    firebase_limit: int
    supabase_url: str
    supabase_key: str
    supabase_tables: list[str]
    supabase_limit: int
    neon_database_url: str
    neon_tables: list[str]
    neon_limit: int
    neon_rest_url: str
    neon_rest_key: str
    neon_rest_schema: str


def _as_int(value: str, default: int) -> int:
    try:
        parsed = int(value)
        return parsed if parsed > 0 else default
    except ValueError:
        return default


def _as_list(value: str, default: str) -> list[str]:
    raw = value.strip() if value.strip() else default
    return [item.strip() for item in raw.split("|") if item.strip()]


def _normalize_supabase_url(url: str) -> str:
    normalized = url.strip().rstrip("/")
    if normalized.endswith("/rest/v1"):
        return normalized[: -len("/rest/v1")]
    return normalized


def _normalize_neon_rest_url(url: str) -> str:
    return url.strip().rstrip("/")


def _normalize_schema(value: str, default: str = "public") -> str:
    normalized = value.strip()
    return normalized if normalized else default


def load_settings() -> DashboardSettings:
    env_path = Path(__file__).with_name(".env")
    load_dotenv(dotenv_path=env_path)
    return DashboardSettings(
        firebase_credentials_path=os.getenv("FIREBASE_CREDENTIALS_PATH", ""),
        firebase_collections=_as_list(
            os.getenv("FIREBASE_COLLECTIONS", ""),
            default=os.getenv("FIREBASE_COLLECTION", "dashboard_items"),
        ),
        firebase_limit=_as_int(os.getenv("FIREBASE_LIMIT", "10"), default=10),
        supabase_url=_normalize_supabase_url(os.getenv("SUPABASE_URL", "")),
        supabase_key=os.getenv("SUPABASE_KEY", ""),
        supabase_tables=_as_list(
            os.getenv("SUPABASE_TABLES", ""),
            default=os.getenv("SUPABASE_TABLE", "dashboard_items"),
        ),
        supabase_limit=_as_int(os.getenv("SUPABASE_LIMIT", "10"), default=10),
        neon_database_url=os.getenv("NEON_DATABASE_URL", ""),
        neon_tables=_as_list(
            os.getenv("NEON_TABLES", ""),
            default=os.getenv("NEON_TABLE", "dashboard_items"),
        ),
        neon_limit=_as_int(os.getenv("NEON_LIMIT", "10"), default=10),
        neon_rest_url=_normalize_neon_rest_url(os.getenv("NEON_REST_URL", "")),
        neon_rest_key=os.getenv("NEON_REST_KEY", ""),
        neon_rest_schema=_normalize_schema(os.getenv("NEON_REST_SCHEMA", "public")),
    )
