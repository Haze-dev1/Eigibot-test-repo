# ADR-0003: Frontend Architecture

**Status:** Accepted
**Date:** 2026-11-07

## Context

Need a fast SPA with a marketing-grade landing page plus four app modules.

## Decision

- **Routing:** React Router. `/` = landing; `/board`, `/docs`, `/tasks`, `/focus` inside an app-shell layout with sidebar
- **State:** React hooks + small context per module. **No Redux/Zustand** — data volume is tiny; server is the source of truth
- **Data fetching:** thin `api.js` wrapper around `fetch`; Vite dev proxy `/api → localhost:8000`
- **Drag & drop (Kanban):** native HTML5 drag-and-drop (no library) — columns are drop targets, order computed client-side and PATCHed
- **Styling:** one `tokens.css` (colors, spacing, type scale) + per-component CSS. Dark theme default. **Design language ("quiet instrument panel"):** characterful display font for headings + clean UI sans + mono for timers; near-black base with ONE signature accent (electric lime); grain overlay, hairline borders; spring-eased micro-interactions; hand-composed layered-gradient artwork on the landing — explicitly avoiding the generic purple-AI-gradient look
- **Command palette:** global `⌘K` palette mounted at router root (works on every route incl. landing); fuzzy search over pages + entities (docs/cards/tasks) + quick actions
- **Cross-links:** card↔doc↔task relations rendered as chips; `[[` mention popover in the doc editor
- **Pomodoro:** `setInterval`-driven countdown component; durations persisted to localStorage only; status chip lifted into app-shell context so it shows on every page

## Alternatives considered

| Option | Why rejected |
|---|---|
| dnd-kit / react-beautiful-dnd | Overkill for 4 columns; native DnD is dependency-free |
| Tailwind | Custom aesthetic (gradients, glass) is cleaner as hand-written tokens |
| SWR/React Query | Unnecessary cache layer for a local single-user API |

## Consequences

- Near-zero dependency footprint → fast install, easy audit
- If DnD UX feels weak later, can adopt dnd-kit without data-model changes
