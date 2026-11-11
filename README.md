# Suite — personal productivity instrument

A single-user, fully local productivity suite: **Board** (Linear-style kanban), **Docs** (Notion-style pages with `[[mentions]]`), **Tasks** (quick list, promote to board), **Focus** (Pomodoro), wired together with a global **⌘K command palette** and a custom dark "quiet instrument panel" design.

Stack: React 18 + Vite · FastAPI + Motor · MongoDB 7 (local Docker, no Atlas).

## Run

```bash
# 1. Database (Docker Desktop must be running)
docker compose up -d

# 2. Backend  → http://localhost:8000
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/uvicorn app.main:app --port 8000

# 3. Frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

### No Docker handy?
```bash
MONGO_MOCK=1 .venv/bin/uvicorn app.main:app --port 8000
```
runs the backend against an in-memory MongoDB stand-in (data resets on restart — demo/dev only).

## Test

```bash
cd backend && .venv/bin/python -m pytest -q   # 16 tests
cd frontend && npm run build                  # production build
```

## Docs

Full planning set in [`documents/`](documents/README.md): PRD, products, user flows, versioning, trackers, ADRs, implementation plan, checklist.

## API

```
GET/POST       /api/kanban/cards        PATCH/DELETE /api/kanban/cards/{id}
GET/POST       /api/docs/pages          GET/PATCH/DELETE /api/docs/pages/{id}
GET/POST       /api/tasks               PATCH/DELETE /api/tasks/{id}
POST           /api/tasks/{id}/promote  GET /api/search?q=…   GET /api/health
```
