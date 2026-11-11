from fastapi import APIRouter

from ..db import get_db
from ..models import serialize

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
async def search(q: str = ""):
    """Fuzzy-ish substring search across docs, cards and tasks (command palette)."""
    db = get_db()
    results = []
    if q.strip():
        rx = {"$regex": q.strip(), "$options": "i"}
        async for d in db.doc_pages.find({"title": rx}).limit(8):
            r = serialize(d)
            results.append({"kind": "doc", "id": r["id"], "title": r["title"]})
        async for c in db.kanban_cards.find({"title": rx}).limit(8):
            r = serialize(c)
            results.append({"kind": "card", "id": r["id"], "title": r["title"]})
        async for t in db.tasks.find({"title": rx}).limit(8):
            r = serialize(t)
            results.append({"kind": "task", "id": r["id"], "title": r["title"]})
    return results
