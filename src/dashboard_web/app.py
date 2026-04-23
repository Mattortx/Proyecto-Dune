from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from .services import build_overview
from .settings import load_settings


app = FastAPI(title="Dune Multi-DB Dashboard", version="0.1.0")
_template = Path(__file__).with_name("index.html")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/overview")
def overview() -> dict[str, object]:
    settings = load_settings()
    return build_overview(settings)


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return _template.read_text(encoding="utf-8")
