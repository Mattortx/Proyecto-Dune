# Dashboard Web Multi-Base de Datos

Este modulo crea un dashboard web con FastAPI para visualizar datos de tres fuentes:

- Firebase (Firestore)
- Supabase
- Neon (PostgreSQL)

## 1) Instalacion

Desde la raiz del repositorio:

```bash
pip install -e .[dashboard]
```

## 2) Configuracion

1. Copia `src/dashboard_web/.env.example` a `src/dashboard_web/.env`.
2. Completa credenciales y nombres de colecciones/tablas.
3. Para Firebase usa una service account JSON con permisos de lectura.
4. Para varias colecciones/tablas usa `|` como separador:
	- `FIREBASE_COLLECTIONS=games|test|users`
	- `SUPABASE_TABLES=tabla_a|tabla_b`
	- `NEON_TABLES=clientes|marketing_document_segments`
5. Si usas Neon con endpoint REST (`.../rest/v1`), configura `NEON_REST_URL`, `NEON_REST_KEY` y `NEON_REST_SCHEMA` (normalmente `public`).

## 3) Ejecucion local

```bash
uvicorn dashboard_web.app:app --host 0.0.0.0 --port 8000 --reload
```

Abrir en el navegador:

```text
http://localhost:8000
```

## 4) Endpoints

- `GET /` -> dashboard web
- `GET /api/health` -> estado del servicio
- `GET /api/overview` -> datos consolidados de Firebase/Supabase/Neon

## 5) Despliegue web

Puedes desplegar en Render, Railway o Fly.io como web service Python.

- Build command: `pip install -e .[dashboard]`
- Start command: `uvicorn dashboard_web.app:app --host 0.0.0.0 --port $PORT`
- Variables de entorno: las mismas definidas en `.env.example`

## 6) Notas operativas

- El dashboard muestra estado `not_configured` cuando falta una credencial.
- Si una fuente falla, las otras se siguen mostrando.
- Por defecto se presentan hasta 10 filas por fuente para no sobrecargar la UI.
- `SUPABASE_URL` puede venir con o sin sufijo `/rest/v1`; el backend lo normaliza.
