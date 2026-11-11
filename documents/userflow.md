# User Flows

## Global navigation
```
Landing (/)
   └── "Open app" (or any feature card) → App shell
        Sidebar: Board | Docs | Tasks | Focus | Home — visible on EVERY page
        ⌘K / Ctrl+K command palette on EVERY route (incl. landing):
          fuzzy jump to any page/entity + quick actions (new card/doc/task, start focus)
        Shell header widgets: Pomodoro status chip + mini task list
```

## Flow 0 — Cross-module linking
1. On a Kanban card, user clicks "Link doc" → picker lists doc pages → card shows a doc chip; clicking it opens that page in Docs
2. On a task, user clicks "→ Board" → task is promoted to a card in Backlog (linked back to the task)
3. In a Doc, typing `[[` opens a mention search across docs/cards/tasks → inserts a clickable link chip

## Flow 1 — Manage work on the Kanban board
1. User opens `/board`
2. App loads cards grouped by column (Backlog, Todo, In Progress, Done)
3. User clicks "+ Add card" in a column → inline form → Enter
   → `POST /api/kanban/cards` → card appears at bottom of column
4. User drags a card to another column
   → `PATCH /api/kanban/cards/{id}` {column, order} → board re-renders
5. User clicks a card → edit title/description or delete

## Flow 2 — Write a document
1. User opens `/docs` → sees page list (sorted by last updated)
2. Clicks "+ New page" → `POST /api/docs/pages` → editor opens
3. Types title + content; autosave debounce (1s) → `PATCH /api/docs/pages/{id}`
4. Returns later → content persisted from MongoDB
5. Delete via page menu → confirm → `DELETE /api/docs/pages/{id}`

## Flow 3 — Daily tasks
1. User opens `/tasks`
2. Types in the quick-add box, picks priority, Enter → `POST /api/tasks`
3. Clicks checkbox → `PATCH /api/tasks/{id}` {done: true} → moves to done section
4. Filters: All / Active / Done
5. Delete with ✕

## Flow 4 — Pomodoro session
1. User opens `/focus`
2. Clicks Start → 25:00 countdown begins
3. Timer hits 0 → notification sound/visual → auto-start 5-min break
4. After 4 work sessions → 15-min long break
5. User can Pause / Reset / Skip at any time
6. (Optional) user adjusts durations in settings popover — stored in localStorage

## Error flows
- Backend unreachable → banner: "API offline — check that backend is running on :8000"
- MongoDB down → backend returns 503; UI shows retry
- Invalid input (empty title) → inline validation, no request sent
