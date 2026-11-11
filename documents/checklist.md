# Checklist Plan — v0.1.0

The build is DONE only when every box below is checked with real execution evidence (not intentions).

## A. Documentation ✅
- [x] PRD.md
- [x] products.md
- [x] userflow.md
- [x] VERSIONING.md
- [x] TRACKERS.md
- [x] ADR.md + ADR-0001/0002/0003
- [x] implementation-plan.md
- [x] checklist.md (this file)
- [ ] **Owner approval**

## B. Infrastructure
- [ ] Docker Desktop running (`docker info` succeeds)
- [ ] `docker compose up -d` starts mongo:7
- [ ] Mongo reachable on localhost:27017
- [ ] Named volume persists data across `docker compose restart`

## C. Backend
- [ ] `pip install -r backend/requirements-dev.txt` succeeds
- [ ] `GET /api/health` → 200
- [ ] Kanban: create / list / move-column / delete via curl or HTTPie
- [ ] Docs: create / get / update / list / delete
- [ ] Tasks: create / toggle / list / delete
- [ ] Invalid input rejected (400s), missing ids → 404
- [ ] `pytest` suite: all green
- [ ] Data written via API is visible in Mongo after backend restart

## D. Frontend
- [ ] `npm install` + `npm run build` clean (no errors)
- [ ] Landing page renders: hero, gradients, 4 feature cards, reveal animations
- [ ] App shell with sidebar nav across /board /docs /tasks /focus
- [ ] Board: add card, drag between columns, edit, delete
- [ ] Docs: new page, edit, autosave, delete
- [ ] Tasks: add with priority, toggle done, filter, delete
- [ ] Focus: start/pause/reset, work→break cycle, settings persist in localStorage

## D2. Interconnectivity
- [ ] Every page reachable from every page (sidebar + ⌘K palette, incl. landing)
- [ ] ⌘K: fuzzy jump + quick actions work on all routes
- [ ] Card ↔ doc link chips work both directions
- [ ] Task promotes to Kanban card
- [ ] Doc `[[mention]]` inserts working link chip
- [ ] Pomodoro chip + mini tasks visible in shell on all module pages

## D3. Design quality
- [ ] Custom font pairing loaded (display + UI + mono)
- [ ] Signature accent + grain + hairline system applied consistently
- [ ] Landing artwork is custom-composed (no stock/generic gradient)
- [ ] Micro-interactions (hover springs, board transitions) feel smooth

## E. End-to-end (browser, real Mongo)
- [ ] Create card in UI → reload page → card still there
- [ ] Move card to Done → reload → still in Done
- [ ] Write doc content → reload → content intact
- [ ] Toggle task → reload → state intact
- [ ] `docker compose restart mongo` → all data intact

## F. Release
- [ ] README.md with setup/run instructions
- [ ] TRACKERS.md all Phase 1–3 items ✅
- [ ] VERSIONING.md updated to v0.1.0
- [ ] Committed + pushed to GitHub (`main`)
- [ ] Git tag `v0.1.0`
