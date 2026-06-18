import os
import pytest
from fastapi.testclient import TestClient

# Set testing environment variable
os.environ["TESTING"] = "True"

from server.app.config import settings  # noqa: E402

settings.TESTING = True

from server.app.main import app  # noqa: E402
from server.app.database import Base, engine, SessionLocal  # noqa: E402
from server.app.models import Guide  # noqa: E402
from server.app.auth import get_password_hash  # noqa: E402


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


@pytest.fixture(scope="function")
def test_guide(db_session):
    guide = Guide(
        guide_id="guide-123",
        name="Tenzing Norgay",
        email="tenzing@example.com",
        password_hash=get_password_hash("password123"),
    )
    db_session.add(guide)
    db_session.commit()
    db_session.refresh(guide)
    return guide


@pytest.fixture(scope="function")
def auth_headers(client, test_guide):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "tenzing@example.com", "password": "password123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
