import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app import db as db_module
from app.main import app


@pytest_asyncio.fixture
async def client():
    db_module.set_client(AsyncMongoMockClient())
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    db_module.set_client(None)


