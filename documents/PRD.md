# Product Requirements Document (PRD)

**Project:** Productivity Suite (working title)
**Repository:** Haze-dev1/Eigibot-test-repo
**Version:** v0.1.0-draft
**Status:** Awaiting approval
**Owner:** Single user (personal tool)
**Date:** 2026-11-07

---

## 1. Overview

A personal, single-user productivity suite combining four tools into one app:

1. **Kanban Board** — Linear-style board for project work
2. **Docs** — Notion-style page/document manager
3. **Task List** — quick todo list with priorities
4. **Pomodoro Timer** — focus timer with work/break cycles

Plus a **landing/home page** inspired by modern AI-product sites (capi.ai, Anti-Gravity): bold hero, gradient aesthetic, smooth reveal animations.

## 2. Goals & Non-Goals

### Goals
- Single cohesive app with a shared left-nav shell
- All data persisted locally in MongoDB (Docker, **no Atlas**)
- Fast, keyboard-friendly UX
- Runs entirely on the local machine: `docker compose up` for Mongo, then frontend + backend

### Non-Goals (v0.x)
- No user accounts / authentication (single-user local tool)
- No real-time collaboration
- No mobile app
- No cloud hosting / deployment

## 3. Tech Stack (approved)

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite, React Router, plain CSS (design tokens) |
| Backend | Python **FastAPI** + Motor (async MongoDB driver) |
| Database | **MongoDB 7 in local Docker** via docker-compose |
| Repo | Haze-dev1/Eigibot-test-repo (monorepo: `frontend/`, `backend/`, `docker-compose.yml`) |

## 4. Feature Requirements

### 4.0 Interconnectivity (cross-cutting)
- **Global nav:** every page (including the landing page) can reach every other page — persistent app-shell sidebar + a **command palette (⌘K / Ctrl+K)** mounted on all routes for fuzzy jump-to-page and quick actions (new card, new doc, new task, start focus)
- **Cross-module links:**
  - Kanban cards can link to a Doc page and to Tasks
  - Tasks can be promoted into Kanban cards
  - Docs support `[[mention]]` links to other docs, cards, and tasks
- **Global widgets:** mini task list and Pomodoro status chip in the app-shell header on every module page

### 4.0b Design language
Deliberately non-generic. Direction: **"quiet instrument panel"** — dark, editorial, tactile.
- Custom type pairing: characterful display face for headings, clean sans for UI, mono for timers/IDs
- Restrained palette: near-black base, ONE signature accent (electric lime), warm neutrals — explicitly NOT the default purple-gradient AI look
- Grain/noise overlay, hairline borders, generous whitespace
- Micro-interactions: spring-eased hovers, subtle magnetic buttons, animated column transitions on the board
- Landing artwork is custom-composed (layered radial gradients + blur + noise), never stock

### 4.1 Landing Page
- Hero section with product name, tagline, gradient/mesh background
- Feature cards for the four modules, each linking into the app
- Scroll-reveal animations, dark aesthetic

### 4.2 Kanban Board (`/board`)
- Columns: Backlog, Todo, In Progress, Done
- Create card (title, description), edit, delete
- Drag-and-drop between columns (order persisted)
- Data: `kanban_cards` collection

### 4.3 Docs (`/docs`)
- Sidebar list of pages; create/rename/delete pages
- Editor: title + markdown/plain-text body, auto-save (debounced)
- Data: `doc_pages` collection

### 4.4 Task List (`/tasks`)
- Add task with priority (low/medium/high)
- Toggle done, delete, filter (all / active / done)
- Data: `tasks` collection

### 4.5 Pomodoro (`/focus`)
- Configurable durations (default 25/5/15 min)
- Start / pause / reset; auto cycle work → short break → long break every 4th
- Session state in browser (no DB persistence required for v0.1)

## 5. API Surface (REST)

```
GET/POST            /api/kanban/cards
PATCH/DELETE        /api/kanban/cards/{id}
GET/POST            /api/docs/pages
GET/PATCH/DELETE    /api/docs/pages/{id}
GET/POST            /api/tasks
PATCH/DELETE        /api/tasks/{id}
GET                 /api/health
```

## 6. Success Criteria (acceptance)

- `docker compose up -d` starts MongoDB locally
- Backend serves all endpoints; pytest suite passes
- Frontend builds; all four modules usable end-to-end in browser
- Data survives container restart (named volume)
- Docs deleted/tasks toggled/cards moved reflect after reload

## 7. Risks

| Risk | Mitigation |
|---|---|
| Docker Desktop not running | Documented start step; backend retries Mongo connection |
| Scope creep | Strict v0.1 cut; backlog tracked in TRACKERS.md |
