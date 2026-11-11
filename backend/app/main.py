from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import get_client
from .routers import docs, kanban, search, tasks

app = FastAPI(title="Productivity Suite API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kanban.router)
app.include_router(docs.router)
app.include_router(tasks.router)
app.include_router(search.router)


@app.get("/api/health")
async def health():
    try:
        await get_client().admin.command("ping")
        mongo = "ok"
    except Exception:
        mongo = "unreachable"
    return {"status": "ok", "mongo": mongo}
