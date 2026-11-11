# ADR-0002: Data Model

**Status:** Accepted
**Date:** 2026-11-07

## Context

Single-user local tool. No accounts, no sharing. Data must survive container restarts.

## Decision

One database `productivity`, three collections:

### `kanban_cards`
```json
{ "_id": ObjectId, "title": str, "description": str,
  "column": "backlog|todo|in_progress|done",
  "order": float, "created_at": ISODateString,
  "doc_id": ObjectId|null, "task_ids": [ObjectId] }
```
`order` is a float so reordering = averaging neighbors, no mass updates.
`doc_id` / `task_ids` implement card→doc and card→task cross-links.

### `doc_pages`
```json
{ "_id": ObjectId, "title": str, "content": str,
  "created_at": ISODateString, "updated_at": ISODateString }
```
Content may contain `[[type:id:title]]` mention chips linking to docs, cards, tasks.

### `tasks`
```json
{ "_id": ObjectId, "title": str, "done": bool,
  "priority": "low|medium|high", "created_at": ISODateString,
  "card_id": ObjectId|null }
```
`card_id` is set when a task is promoted to a Kanban card.

### Not persisted
- Pomodoro state (ephemeral; settings in localStorage)

## Alternatives considered

| Option | Why rejected |
|---|---|
| Single generic `items` collection | Loses query clarity and per-module indexes |
| Embedded docs-in-board | Docs are standalone, not tied to cards (linking deferred to backlog) |

## Consequences

- Simple CRUD per collection; no joins needed
- Schema changes are cheap pre-1.0 (local data, wipe-and-recreate acceptable)
