# Versioning

The project follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`), tracked in this file, in git tags, and in `package.json` / backend metadata.

## Current version

**v0.1.0** — first working release

## Version history

| Version | Date | Status | Notes |
|---|---|---|---|
| v0.1.0-draft | 2026-11-07 | ✅ | Documentation set created; approved |
| v0.1.0 | 2026-11-11 | ✅ | All four modules + landing + ⌘K palette + cross-links; 16/16 backend tests; browser E2E verified (in-memory Mongo mode; real-Mongo persistence check pending owner-run `docker compose up -d`) |

## Rules

- **MAJOR** — breaking changes to API contracts or data schema migrations
- **MINOR** — new module, new feature, backwards-compatible API additions
- **PATCH** — bug fixes, UI polish, refactors

## Planned milestones

| Version | Target content |
|---|---|
| v0.1.0 | Scaffold + all four modules functional locally, tests passing |
| v0.2.0 | Polish: animations, keyboard shortcuts, empty states |
| v0.3.0 | Pomodoro stats, task↔card linking, doc search |
| v1.0.0 | Stable API, full test coverage, production-grade README |

## Tagging

Each approved version gets a git tag: `git tag -a v0.1.0 -m "..."` and a matching entry above.
