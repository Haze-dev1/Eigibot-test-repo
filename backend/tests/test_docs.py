import pytest



async def test_page_crud(client):
    r = await client.post("/api/docs/pages", json={"title": "Notes", "content": "hi"})
    assert r.status_code == 201
    page = r.json()
    assert page["created_at"] and page["updated_at"]

    r = await client.get(f"/api/docs/pages/{page['id']}")
    assert r.json()["content"] == "hi"

    r = await client.patch(f"/api/docs/pages/{page['id']}",
                           json={"content": "edited"})
    assert r.json()["content"] == "edited"
    assert r.json()["updated_at"] >= page["updated_at"]

    r = await client.get("/api/docs/pages")
    assert len(r.json()) == 1

    r = await client.delete(f"/api/docs/pages/{page['id']}")
    assert r.status_code == 204
    r = await client.get(f"/api/docs/pages/{page['id']}")
    assert r.status_code == 404


async def test_page_not_found(client):
    r = await client.get("/api/docs/pages/000000000000000000000000")
    assert r.status_code == 404


async def test_page_invalid_id(client):
    r = await client.get("/api/docs/pages/not-an-id")
    assert r.status_code == 404


async def test_empty_patch_rejected(client):
    r = await client.post("/api/docs/pages", json={"title": "x"})
    pid = r.json()["id"]
    r = await client.patch(f"/api/docs/pages/{pid}", json={})
    assert r.status_code == 400
