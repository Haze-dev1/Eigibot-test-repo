from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def valid_id(value: str) -> bool:
    return isinstance(value, str) and ObjectId.is_valid(value)


# ---- Kanban ----

class KanbanCardIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = ""
    column: str = Field(default="backlog")
    doc_id: Optional[str] = None


class KanbanCardUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    description: Optional[str] = None
    column: Optional[str] = None
    order: Optional[float] = None
    doc_id: Optional[str] = None


# ---- Docs ----

class DocPageIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    content: str = ""


class DocPageUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    content: Optional[str] = None


# ---- Tasks ----

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    priority: str = Field(default="medium")  # low | medium | high


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    done: Optional[bool] = None
    priority: Optional[str] = None


# ---- Search (command palette) ----

class SearchResult(BaseModel):
    kind: str  # doc | card | task
    id: str
    title: str
