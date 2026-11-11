# Products

The suite ships as one app with four product modules and one marketing-style entry point.

## 0. Home (Landing)
Public-facing front door of the suite.
- **Inspiration:** capi.ai / Anti-Gravity style — dark theme, mesh gradients, oversized typography, scroll reveals
- Hero + 4 feature cards + "Open app" CTA

## 1. Board (Kanban)
Linear-style project board.
- Columns: Backlog → Todo → In Progress → Done
- Cards with title/description, drag-and-drop, persistent ordering
- **Primary user value:** see project state at a glance

## 2. Docs (Pages)
Notion-style document manager.
- Page list sidebar, markdown-ish editor, autosave
- **Primary user value:** notes/specs living next to the work

## 3. Tasks (Todo)
Lightweight daily task list.
- Priorities, done toggles, filters
- **Primary user value:** capture-and-forget quick tasks

## 4. Focus (Pomodoro)
Focus timer.
- Work/short/long-break cycles, configurable durations
- **Primary user value:** structured focus sessions without leaving the suite

## Module relationships
Every module is reachable from every page (sidebar + ⌘K command palette, also on the landing page), and data crosses module boundaries:

```
                 ┌──────────────┐
                 │  ⌘K palette  │  (available on ALL routes)
                 └──────┬───────┘
                        │
Home ──┬── Board ──link──▶ Docs (cards reference doc pages)
       │    └──promote──▶ Tasks become cards
       ├── Docs ──[[mention]]──▶ Docs / Cards / Tasks
       ├── Tasks ──promote──▶ Board
       └── Focus ──status chip──▶ visible in shell everywhere
```

All modules share one app shell (sidebar nav + global widgets) and one MongoDB database (`productivity`).
