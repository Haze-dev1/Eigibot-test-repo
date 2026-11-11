# Trackers

Living document for work items. Status legend: 🔲 todo · 🟡 in progress · ✅ done · ⛔ blocked

## Phase 0 — Documentation (current)

| ID | Item | Status |
|---|---|---|
| P0-1 | PRD | ✅ |
| P0-2 | products.md | ✅ |
| P0-3 | userflow.md | ✅ |
| P0-4 | VERSIONING.md | ✅ |
| P0-5 | TRACKERS.md | ✅ |
| P0-6 | ADRs | ✅ |
| P0-7 | implementation-plan.md | ✅ |
| P0-8 | checklist.md | ✅ |
| P0-9 | **Owner approval of docs** | ✅ |

## Phase 1 — Foundation

| ID | Item | Status | Depends on |
|---|---|---|---|
| P1-1 | Repo scaffold (frontend/, backend/, compose) | ✅ | P0-9 |
| P1-2 | docker-compose with MongoDB 7 + volume | ✅ (compose written; container start handed to owner — sandbox can't reach docker socket) | P1-1 |
| P1-3 | FastAPI app skeleton + /api/health | ✅ | P1-1 |
| P1-4 | Vite React scaffold + router + app shell | ✅ | P1-1 |
| P1-5 | Backend pytest setup (mongomock-motor) | ✅ | P1-3 |

## Phase 2 — Modules

| ID | Item | Status | Depends on |
|---|---|---|---|
| P2-1 | Kanban API (CRUD + move/reorder) | ✅ | P1-3 |
| P2-2 | Kanban UI (columns, drag-drop) | ✅ | P2-1, P1-4 |
| P2-3 | Docs API (pages CRUD) | ✅ | P1-3 |
| P2-4 | Docs UI (list + editor + autosave) | ✅ | P2-3, P1-4 |
| P2-5 | Tasks API (CRUD + toggle) | ✅ | P1-3 |
| P2-6 | Tasks UI (list, filters, priorities) | ✅ | P2-5, P1-4 |
| P2-7 | Pomodoro timer (client-side) | ✅ | P1-4 |
| P2-8 | Landing page (hero, cards, animations) | ✅ | P1-4 |
| P2-9 | ⌘K command palette on all routes | ✅ | P2-2, P2-4, P2-6 |
| P2-10 | Cross-links: card↔doc chips, task→card promote, doc `[[mentions]]` | ✅ | P2-1, P2-3, P2-5 |
| P2-11 | Global shell widgets (Pomodoro chip, mini task list) | ✅ | P2-6, P2-7 |

## Phase 3 — Verification & Release

| ID | Item | Status | Depends on |
|---|---|---|---|
| P3-1 | Backend test suite green | ✅ 16/16 | P2-x |
| P3-2 | End-to-end browser verification of all flows | ✅ (against in-memory Mongo mode; real-Mongo persistence pending owner running `docker compose up -d`) | P2-x |
| P3-3 | README with run instructions | ✅ | P3-1 |
| P3-4 | Commit + push, tag v0.1.0 | 🟡 | P3-2 |

## Backlog (post-v0.1)

- Pomodoro session history/stats
- Task ↔ Kanban card linking
- Full-text doc search
- Keyboard shortcuts (global)
- Export/import of all data (JSON)
