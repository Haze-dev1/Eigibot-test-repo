from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException

from ..db import get_db
from ..models import DocPageIn, DocPageUpdate, serialize, valid_id

router = APIRouter(prefix="/api/docs", tags=["docs"])


def _coll():
    return get_db().doc_pages


@router.get("/pages")
async def list_pages():
    cursor = _coll().find().sort("updated_at", -1)
    return [serialize(p) async for p in cursor]


@router.get("/pages/{page_id}")
async def get_page(page_id: str):
    if not valid_id(page_id):
        raise HTTPException(404, "page not found")
    page = await _coll().find_one({"_id": ObjectId(page_id)})
    if page is None:
        raise HTTPException(404, "page not found")
    return serialize(page)


@router.post("/pages", status_code=201)
async def create_page(page: DocPageIn):
    now = datetime.now(timezone.utc).isoformat()
    doc = {"title": page.title, "content": page.content,
           "created_at": now, "updated_at": now}
    result = await _coll().insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)


@router.patch("/pages/{page_id}")
async def update_page(page_id: str, patch: DocPageUpdate):
    if not valid_id(page_id):
        raise HTTPException(404, "page not found")
    updates = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "no fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await _coll().find_one_and_update(
        {"_id": ObjectId(page_id)}, {"$set": updates}, return_document=True
    )
    if result is None:
        raise HTTPException(404, "page not found")
    return serialize(result)


@router.delete("/pages/{page_id}", status_code=204)
async def delete_page(page_id: str):
    if not valid_id(page_id):
        raise HTTPException(404, "page not found")
    result = await _coll().delete_one({"_id": ObjectId(page_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "page not found")
    await get_db().kanban_cards.update_many({"doc_id": page_id}, {"$set": {"doc_id": None}})
