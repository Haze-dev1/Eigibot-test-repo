import pytest



async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_create_and_list_cards(client):
    r = await client.post("/api/kanban/cards", json={"title": "First card"})
    assert r.status_code == 201
    card = r.json()
    assert card["column"] == "backlog"
    assert card["order"] == 1.0
    assert card["task_ids"] == []

    r = await client.get("/api/kanban/cards")
    assert len(r.json()) == 1


async def test_card_requires_title(client):
    r = await client.post("/api/kanban/cards", json={"title": ""})
    assert r.status_code == 422


async def test_card_bad_column_rejected(client):
    r = await client.post("/api/kanban/cards", json={"title": "x", "column": "nope"})
    assert r.status_code == 400


async def test_move_card_to_top_of_column(client):
    r1 = await client.post("/api/kanban/cards", json={"title": "a"})
    r2 = await client.post("/api/kanban/cards", json={"title": "b"})
    c1, c2 = r1.json()["id"], r2.json()["id"]
    r = await client.patch(f"/api/kanban/cards/{c2}", json={"column": "todo"})
    assert r.status_code == 200
    assert r.json()["column"] == "todo"

    r = await client.get("/api/kanban/cards")
    cols = {c["id"]: c["column"] for c in r.json()}
    assert cols[c1] == "backlog" and cols[c2] == "todo"


async def test_update_card_missing_404(client):
    r = await client.patch("/api/kanban/cards/000000000000000000000000",
                           json={"title": "x"})
    assert r.status_code == 404


async def test_delete_card_unlinks_tasks(client):
    r = await client.post("/api/tasks", json={"title": "t"})
    tid = r.json()["id"]
    r = await client.post(f"/api/tasks/{tid}/promote")
    card = r.json()
    r = await client.get("/api/tasks")
    assert r.json()[0]["card_id"] == card["id"]
    r = await client.delete(f"/api/kanban/cards/{card['id']}")
    assert r.status_code == 204
    r = await client.get("/api/tasks")
    assert r.json()[0]["card_id"] is None


async def test_card_doc_link(client):
    r = await client.post("/api/docs/pages", json={"title": "Spec"})
    doc = r.json()
    r = await client.post("/api/kanban/cards",
                          json={"title": "c", "doc_id": doc["id"]})
    assert r.status_code == 201
    assert r.json()["doc_id"] == doc["id"]
    # delete doc -> card link cleared
    await client.delete(f"/api/docs/pages/{doc['id']}")
    r = await client.get("/api/kanban/cards")
    assert r.json()[0]["doc_id"] is None
