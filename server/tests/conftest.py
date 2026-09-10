import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Set environment variables for testing
os.environ["TESTING"] = "true"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-123456789012345678901234567890"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from server.database import Base, get_db, seed_data
from server.main import app

# Shared test in-memory SQLite engine
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_schema_once():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_and_seed_tables():
    """Function-scoped: wipe data and re-seed between tests so test state is isolated."""
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def admin_headers(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def staff_headers(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "staff@example.com", "password": "adminpassword"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def patron_headers(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
