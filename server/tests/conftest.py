import pytest
from fastapi.testclient import TestClient
from server.main import app
from server.database import engine, Base, init_db
import server.models  # noqa: F401


@pytest.fixture(autouse=True)
def setup_test_db():
    app.dependency_overrides.clear()
    Base.metadata.create_all(bind=engine)
    init_db()
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
