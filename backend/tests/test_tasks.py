import pytest



async def test_task_crud_and_toggle(client):
    r = await client.post("/api/tasks", json={"title": "Buy milk", "priority": "high"})
    assert r.status_code == 201
    task = r.json()
    assert task["done"] is False

    r = await client.patch(f"/api/tasks/{task['id']}", json={"done": True})
    assert r.json()["done"] is True

    r = await client.get("/api/tasks")
    assert len(r.json()) == 1

    r = await client.delete(f"/api/tasks/{task['id']}")
    assert r.status_code == 204


async def test_bad_priority(client):
    r = await client.post("/api/tasks", json={"title": "x", "priority": "urgent!!"})
    assert r.status_code == 400


async def test_promote_task_to_card(client):
    r = await client.post("/api/tasks", json={"title": "Ship it"})
    tid = r.json()["id"]
    r = await client.post(f"/api/tasks/{tid}/promote")
    assert r.status_code == 201
    card = r.json()
    assert card["column"] == "backlog"
    assert card["task_ids"] == [tid]

    # double promote rejected
    r = await client.post(f"/api/tasks/{tid}/promote")
    assert r.status_code == 409

    r = await client.get("/api/tasks")
    assert r.json()[0]["card_id"] == card["id"]


async def test_search(client):
    await client.post("/api/tasks", json={"title": "water the plants"})
    await client.post("/api/docs/pages", json={"title": "Plant care notes"})
    await client.post("/api/kanban/cards", json={"title": "unrelated"})
    r = await client.get("/api/search", params={"q": "plant"})
    kinds = {x["kind"] for x in r.json()}
    assert "task" in kinds and "doc" in kinds and "card" not in kinds
