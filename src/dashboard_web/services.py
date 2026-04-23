from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any

import httpx
from psycopg import connect, sql
from supabase import Client, create_client

from .settings import DashboardSettings

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except Exception:  # pragma: no cover - optional runtime dependency safety
    firebase_admin = None
    credentials = None
    firestore = None


@dataclass(slots=True)
class SourceSnapshot:
    source: str
    status: str
    total: int | None
    rows: list[dict[str, Any]]
    message: str | None = None


def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    if isinstance(value, dict):
        return {k: _serialize_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize_value(v) for v in value]
    return value


def _not_configured(source: str, message: str) -> SourceSnapshot:
    return SourceSnapshot(source=source, status="not_configured", total=None, rows=[], message=message)


def fetch_firebase(settings: DashboardSettings) -> SourceSnapshot:
    if not settings.firebase_credentials_path:
        return _not_configured("firebase", "FIREBASE_CREDENTIALS_PATH no configurado")

    if firebase_admin is None or credentials is None or firestore is None:
        return SourceSnapshot(
            source="firebase",
            status="error",
            total=None,
            rows=[],
            message="firebase-admin no disponible en el entorno",
        )

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)

        db = firestore.client()
        rows = []
        total = 0
        for collection in settings.firebase_collections:
            docs = db.collection(collection).limit(settings.firebase_limit).stream()
            collection_rows = []
            for item in docs:
                payload = item.to_dict() or {}
                payload["id"] = item.id
                payload["_collection"] = collection
                collection_rows.append(_serialize_value(payload))

            total += len(collection_rows)
            rows.extend(collection_rows)

        return SourceSnapshot(source="firebase", status="ok", total=total, rows=rows)
    except Exception as exc:
        return SourceSnapshot(source="firebase", status="error", total=None, rows=[], message=str(exc))


def _supabase_client(settings: DashboardSettings) -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)


def fetch_supabase(settings: DashboardSettings) -> SourceSnapshot:
    if not settings.supabase_url or not settings.supabase_key:
        return _not_configured("supabase", "SUPABASE_URL o SUPABASE_KEY sin configurar")

    try:
        client = _supabase_client(settings)
        rows = []
        total = 0
        for table in settings.supabase_tables:
            response = (
                client.table(table)
                .select("*", count="exact")
                .limit(settings.supabase_limit)
                .execute()
            )
            total += int(response.count or 0)
            table_rows = []
            for row in response.data or []:
                serialized = _serialize_value(row)
                if isinstance(serialized, dict):
                    serialized["_table"] = table
                table_rows.append(serialized)
            rows.extend(table_rows)

        return SourceSnapshot(
            source="supabase",
            status="ok",
            total=total,
            rows=rows,
            message=None,
        )
    except Exception as exc:
        return SourceSnapshot(source="supabase", status="error", total=None, rows=[], message=str(exc))


def fetch_neon(settings: DashboardSettings) -> SourceSnapshot:
    if settings.neon_rest_url:
        return _fetch_neon_rest(settings)

    if not settings.neon_database_url:
        return _not_configured("neon", "NEON_DATABASE_URL no configurado")

    try:
        with connect(settings.neon_database_url) as conn:
            total = 0
            rows = []
            failures = []
            with conn.cursor() as cur:
                for table in settings.neon_tables:
                    try:
                        count_stmt = sql.SQL("SELECT COUNT(*) FROM {table}").format(
                            table=sql.Identifier(table)
                        )
                        cur.execute(count_stmt)
                        total += int(cur.fetchone()[0])

                        data_stmt = sql.SQL("SELECT * FROM {table} LIMIT %s").format(
                            table=sql.Identifier(table)
                        )
                        cur.execute(data_stmt, (settings.neon_limit,))
                        columns = [desc.name for desc in cur.description]
                        table_rows = []
                        for record in cur.fetchall():
                            payload = {columns[index]: value for index, value in enumerate(record)}
                            payload["_table"] = table
                            table_rows.append(_serialize_value(payload))
                        rows.extend(table_rows)
                    except Exception as table_exc:
                        failures.append(f"{table}: {table_exc}")
                        conn.rollback()

        if rows:
            message = None
            if failures:
                message = "Errores parciales: " + " | ".join(failures[:2])
            return SourceSnapshot(source="neon", status="ok", total=total, rows=rows, message=message)

        if failures:
            return SourceSnapshot(
                source="neon",
                status="error",
                total=None,
                rows=[],
                message=" ; ".join(failures[:3]),
            )

        return SourceSnapshot(source="neon", status="ok", total=0, rows=[])
    except Exception as exc:
        return SourceSnapshot(source="neon", status="error", total=None, rows=[], message=str(exc))


def _fetch_neon_rest(settings: DashboardSettings) -> SourceSnapshot:
    headers = {
        "Accept": "application/json",
        "Accept-Profile": settings.neon_rest_schema,
        "Content-Profile": settings.neon_rest_schema,
    }
    if settings.neon_rest_key:
        headers["Authorization"] = f"Bearer {settings.neon_rest_key}"
        headers["apikey"] = settings.neon_rest_key

    try:
        total = 0
        rows = []
        timeout = httpx.Timeout(20.0)
        with httpx.Client(timeout=timeout) as client:
            for table in settings.neon_tables:
                response = client.get(
                    f"{settings.neon_rest_url}/{table}",
                    headers=headers,
                    params={
                        "select": "*",
                        "limit": str(settings.neon_limit),
                    },
                )
                response.raise_for_status()
                data = response.json()
                table_rows = []
                for row in data:
                    serialized = _serialize_value(row)
                    if isinstance(serialized, dict):
                        serialized["_table"] = table
                    table_rows.append(serialized)
                total += len(table_rows)
                rows.extend(table_rows)

        return SourceSnapshot(source="neon", status="ok", total=total, rows=rows)
    except httpx.HTTPStatusError as exc:
        details = exc.response.text.strip()
        message = f"HTTP {exc.response.status_code} en Neon REST"
        if details:
            message = f"{message}: {details[:300]}"
        return SourceSnapshot(source="neon", status="error", total=None, rows=[], message=message)
    except Exception as exc:
        return SourceSnapshot(source="neon", status="error", total=None, rows=[], message=str(exc))


def build_overview(settings: DashboardSettings) -> dict[str, Any]:
    snapshots = [
        fetch_firebase(settings),
        fetch_supabase(settings),
        fetch_neon(settings),
    ]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sources": [asdict(snapshot) for snapshot in snapshots],
    }
