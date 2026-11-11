from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from ..db import get_db
from ..models import TaskIn, TaskUpdate, serialize, valid_id

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

PRIORITIES = ["low", "medium", "high"]


def _coll():
    return get_db().tasks


@router.get("")
async def list_tasks():
    cursor = _coll().find().sort([("done", 1), ("created_at", -1)])
    return [serialize(t) async for t in cursor]


@router.post("", status_code=201)
async def create_task(task: TaskIn):
    if task.priority not in PRIORITIES:
        raise HTTPException(400, f"priority must be one of {PRIORITIES}")
    doc = {
        "title": task.title,
        "done": False,
        "priority": task.priority,
        "card_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await _coll().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.patch("/{task_id}")
async def update_task(task_id: str, patch: TaskUpdate):
    if not valid_id(task_id):
        raise HTTPException(404, "task not found")
    updates = {k: v for k, v in patch.model_dump().items() if v is not None}
    if "priority" in updates and updates["priority"] not in PRIORITIES:
        raise HTTPException(400, f"priority must be one of {PRIORITIES}")
    if not updates:
        raise HTTPException(400, "no fields to update")
    result = await _coll().find_one_and_update(
        {"_id": ObjectId(task_id)}, {"$set": updates}, return_document=True
    )
    if result is None:
        raise HTTPException(404, "task not found")
    return serialize(result)


@router.post("/{task_id}/promote", status_code=201)
async def promote_task(task_id: str):
    """Promote a task to a Kanban card in Backlog, linked both ways."""
    if not valid_id(task_id):
        raise HTTPException(404, "task not found")
    task = await _coll().find_one({"_id": ObjectId(task_id)})
    if task is None:
        raise HTTPException(404, "task not found")
    if task.get("card_id"):
        raise HTTPException(409, "task already promoted")
    cards = get_db().kanban_cards
    top = await cards.find_one({"column": "backlog"}, sort=[("order", -1)])
    card = {
        "title": task["title"],
        "description": "",
        "column": "backlog",
        "order": (top["order"] + 1) if top else 1.0,
        "doc_id": None,
        "task_ids": [task_id],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await cards.insert_one(card)
    await _coll().update_one({"_id": task["_id"]}, {"$set": {"card_id": str(result.inserted_id)}})
    card["_id"] = result.inserted_id
    return serialize(card)


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str):
    if not valid_id(task_id):
        raise HTTPException(404, "task not found")
    result = await _coll().delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "task not found")
    await get_db().kanban_cards.update_many({}, {"$pull": {"task_ids": task_id}})
