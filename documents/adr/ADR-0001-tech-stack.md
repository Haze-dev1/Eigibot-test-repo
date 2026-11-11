# ADR-0001: Tech Stack

**Status:** Accepted
**Date:** 2026-11-07

## Context

Personal productivity suite, single user, must run fully locally. Owner explicitly requested: React frontend, FastAPI Python backend, local Docker MongoDB (no Atlas).

## Decision

- **Frontend:** React 18 + Vite + React Router v6, plain CSS with design tokens (no Tailwind — keeps bundle small and style fully custom for the capi.ai-style landing)
- **Backend:** FastAPI + Motor (async Mongo driver), Pydantic v2 models, pytest for tests
- **Database:** MongoDB 7 in Docker via `docker-compose.yml`, named volume for persistence
- **Monorepo layout:**
  ```
  frontend/          Vite React app
  backend/           FastAPI app (app/, tests/)
  docker-compose.yml MongoDB service
  documents/         this documentation set
  ```

## Alternatives considered

| Option | Why rejected |
|---|---|
| Express/Node backend | Owner chose FastAPI |
| MongoDB Atlas | Owner requires fully local |
| SQLite | Owner requires MongoDB |
| Next.js | Unneeded SSR for a local tool; Vite is lighter |

## Consequences

- Requires Docker Desktop running for the database
- Two dev processes (Vite :5173, Uvicorn :8000) with a dev proxy from Vite → backend
