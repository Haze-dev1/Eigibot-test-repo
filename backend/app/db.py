import os

from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGO_DB", "productivity")

_client = None


def get_client():
    global _client
    if _client is None:
        if os.environ.get("MONGO_MOCK") == "1":
            # In-memory mode (no Docker/DB needed): same Motor API, data is
            # lost on restart. Use only for local demo/E2E without MongoDB.
            from mongomock_motor import AsyncMongoMockClient
            _client = AsyncMongoMockClient()
        else:
            _client = AsyncIOMotorClient(MONGO_URL)
    return _client


def get_db():
    return get_client()[DB_NAME]


def set_client(client) -> None:
    """Test hook: swap in a mock client (e.g. mongomock_motor)."""
    global _client
    _client = client
