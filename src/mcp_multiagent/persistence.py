from __future__ import annotations

from dataclasses import asdict
from typing import Protocol
import json
import sqlite3

from .agent_base import BaseMutantAgent, MutationState


class MutationStore(Protocol):
    def save(self, tenant: str, agent: BaseMutantAgent) -> None:
        ...

    def load(self, tenant: str, agent_name: str) -> MutationState | None:
        ...


class SQLiteMutationStore:
    """Simple local persistence for mutation traits by tenant and agent."""

    def __init__(self, db_path: str = "mcp_mutations.db") -> None:
        self._db_path = db_path
        self._init_schema()

    def _init_schema(self) -> None:
        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS agent_mutations (
                    tenant TEXT NOT NULL,
                    agent_name TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    PRIMARY KEY (tenant, agent_name)
                )
                """
            )

    def save(self, tenant: str, agent: BaseMutantAgent) -> None:
        payload = json.dumps(asdict(agent.mutation))
        with sqlite3.connect(self._db_path) as conn:
            conn.execute(
                """
                INSERT INTO agent_mutations (tenant, agent_name, payload)
                VALUES (?, ?, ?)
                ON CONFLICT(tenant, agent_name)
                DO UPDATE SET payload = excluded.payload
                """,
                (tenant, agent.name, payload),
            )

    def load(self, tenant: str, agent_name: str) -> MutationState | None:
        with sqlite3.connect(self._db_path) as conn:
            row = conn.execute(
                "SELECT payload FROM agent_mutations WHERE tenant = ? AND agent_name = ?",
                (tenant, agent_name),
            ).fetchone()
        if row is None:
            return None
        payload = json.loads(row[0])
        return MutationState(**payload)


class PostgresMutationStore:
    """PostgreSQL store. Requires psycopg to be installed."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._conn = self._connect()
        self._init_schema()

    def _connect(self):
        try:
            import psycopg  # type: ignore
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError("psycopg is required for PostgresMutationStore") from exc
        return psycopg.connect(self._dsn)

    def _init_schema(self) -> None:
        with self._conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS agent_mutations (
                    tenant TEXT NOT NULL,
                    agent_name TEXT NOT NULL,
                    payload JSONB NOT NULL,
                    PRIMARY KEY (tenant, agent_name)
                )
                """
            )
            self._conn.commit()

    def save(self, tenant: str, agent: BaseMutantAgent) -> None:
        with self._conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO agent_mutations (tenant, agent_name, payload)
                VALUES (%s, %s, %s)
                ON CONFLICT (tenant, agent_name)
                DO UPDATE SET payload = EXCLUDED.payload
                """,
                (tenant, agent.name, json.dumps(asdict(agent.mutation))),
            )
            self._conn.commit()

    def load(self, tenant: str, agent_name: str) -> MutationState | None:
        with self._conn.cursor() as cur:
            cur.execute(
                "SELECT payload FROM agent_mutations WHERE tenant = %s AND agent_name = %s",
                (tenant, agent_name),
            )
            row = cur.fetchone()
        if row is None:
            return None
        payload = row[0]
        if isinstance(payload, str):
            payload = json.loads(payload)
        return MutationState(**payload)
