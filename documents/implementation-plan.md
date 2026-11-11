# Implementation Plan

**Scope:** v0.1.0 — all four modules + landing, fully local.
**Prerequisite:** Owner approval of this document set (TRACKERS.md P0-9).

## Step 0 — Repo & tooling
- Verify Docker Desktop running (`docker info`)
- Create `frontend/`, `backend/`, `docker-compose.yml`, `.gitignore`, `README.md`

## Step 1 — Database
`docker-compose.yml`:
```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
volumes:
  mongo_data:
```
Verify: `docker compose up -d` → `mongosh` ping (or docker exec).

## Step 2 — Backend (FastAPI)

```
backend/
  requirements.txt        fastapi, uvicorn, motor, pydantic
  requirements-dev.txt    + pytest, pytest-asyncio, httpx, mongomock-motor
  app/
    main.py               FastAPI app, CORS, router mounting, /api/health
    db.py                 Motor client (MONGO_URL env, default mongodb://localhost:27017)
    models.py             Pydantic input models + serializer
    routers/
      kanban.py           CRUD + move/reorder
      docs.py             pages CRUD
      tasks.py            CRUD + toggle
  tests/
    test_kanban.py  test_docs.py  test_tasks.py   (mongomock-motor, no Docker needed)
```

Order: skeleton+health → tasks (simplest) → docs → kanban (ordering logic) → tests per router.

## Step 3 — Frontend (Vite React)

```
frontend/
  index.html  package.json  vite.config.js (proxy /api→:8000)
  src/
    main.jsx  App.jsx (router)
    styles/tokens.css  global.css
    api/client.js
    pages/ Landing.jsx  Board.jsx  Docs.jsx  Tasks.jsx  Focus.jsx
    components/ AppShell.jsx  (plus per-page components)
```

Order: scaffold + shell + tokens → Tasks → Docs → Board (DnD) → Focus → Landing (polish last).

## Step 4 — Integration & verification
1. `docker compose up -d` (Mongo)
2. Backend: `pip install -r requirements-dev.txt`, `pytest` green, `uvicorn` on :8000
3. Frontend: `npm install`, `npm run build` clean, dev server on :5173
4. Browser E2E against every acceptance flow in userflow.md:
   - create/move/delete kanban card → reload → persisted
   - create/edit doc page → reload → persisted
   - add/toggle task → reload → persisted
   - pomodoro start/pause/reset works
   - landing renders with animations
5. Container restart → data still present (volume check)

## Step 5 — Ship
- README (run instructions, screenshots section)
- Update TRACKERS.md statuses + VERSIONING.md
- Commit, push to `main`, tag `v0.1.0`

## Time/effort estimate
| Phase | Estimate |
|---|---|
| Backend + tests | ~40% |
| Frontend modules | ~40% |
| Landing polish + E2E + docs | ~20% |
