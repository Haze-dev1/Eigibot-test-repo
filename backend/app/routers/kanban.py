from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from ..db import get_db
from ..models import KanbanCardIn, KanbanCardUpdate, serialize, valid_id

router = APIRouter(prefix="/api/kanban", tags=["kanban"])

COLUMNS = ["backlog", "todo", "in_progress", "done"]


def _coll():
    return get_db().kanban_cards


def _expand(card: dict) -> dict:
    """Attach linked task summaries for chips."""
    return card


@router.get("/cards")
async def list_cards():
    cursor = _coll().find().sort([("column", 1), ("order", 1)])
    return [serialize(c) async for c in cursor]


@router.post("/cards", status_code=201)
async def create_card(card: KanbanCardIn):
    if card.column not in COLUMNS:
        raise HTTPException(400, f"column must be one of {COLUMNS}")
    if card.doc_id and not valid_id(card.doc_id):
        raise HTTPException(400, "invalid doc_id")
    top = await _coll().find_one({"column": card.column}, sort=[("order", -1)])
    doc = {
        "title": card.title,
        "description": card.description,
        "column": card.column,
        "order": (top["order"] + 1) if top else 1.0,
        "doc_id": card.doc_id,
        "task_ids": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await _coll().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.patch("/cards/{card_id}")
async def update_card(card_id: str, patch: KanbanCardUpdate):
    if not valid_id(card_id):
        raise HTTPException(404, "card not found")
    updates = {k: v for k, v in patch.model_dump().items() if v is not None}
    if "doc_id" in patch.model_fields_set:
        updates["doc_id"] = patch.doc_id  # explicit null clears the link
    if "column" in updates and updates["column"] not in COLUMNS:
        raise HTTPException(400, f"column must be one of {COLUMNS}")
    if "doc_id" in updates and updates["doc_id"] and not valid_id(updates["doc_id"]):
        raise HTTPException(400, "invalid doc_id")
    if "column" in updates and "order" not in updates:
        top = await _coll().find_one({"column": updates["column"]}, sort=[("order", -1)])
        updates["order"] = (top["order"] + 1) if top else 1.0
    if not updates:
        raise HTTPException(400, "no fields to update")
    result = await _coll().find_one_and_update(
        {"_id": ObjectId(card_id)}, {"$set": updates}, return_document=True
    )
    if result is None:
        raise HTTPException(404, "card not found")
    return serialize(result)


@router.delete("/cards/{card_id}", status_code=204)
async def delete_card(card_id: str):
    if not valid_id(card_id):
        raise HTTPException(404, "card not found")
    result = await _coll().delete_one({"_id": ObjectId(card_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "card not found")
    # unlink any tasks pointing at this card
    await get_db().tasks.update_many({"card_id": card_id}, {"$set": {"card_id": None}})
