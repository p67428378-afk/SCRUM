import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import Base, get_db, seed_data
from server.main import app
from server import models
from server.auth import create_access_token

# Test SQLite in-memory database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def admin_headers(client):
    db = TestingSessionLocal()
    admin = (
        db.query(models.User).filter(models.User.email == "admin@example.com").first()
    )
    token = create_access_token(data={"sub": admin.email, "role": admin.role})
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def resident_headers(client):
    db = TestingSessionLocal()
    resident = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    token = create_access_token(data={"sub": resident.email, "role": resident.role})
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def staff_headers(client):
    db = TestingSessionLocal()
    staff = (
        db.query(models.User).filter(models.User.email == "staff@example.com").first()
    )
    token = create_access_token(data={"sub": staff.email, "role": staff.role})
    db.close()
    return {"Authorization": f"Bearer {token}"}
