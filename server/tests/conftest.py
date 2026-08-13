import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import Base, get_db, seed_data
from server.main import app
from server.auth import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
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


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def admin_auth_headers():
    token = create_access_token(
        data={
            "sub": "admin@example.com",
            "role": "Admin",
            "user_id": "00000000-0000-0000-0000-000000000001",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def staff_auth_headers():
    token = create_access_token(
        data={
            "sub": "test@example.com",
            "role": "Front Desk Staff",
            "user_id": "00000000-0000-0000-0000-000000000002",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def housekeeping_auth_headers():
    token = create_access_token(
        data={
            "sub": "housekeeping@example.com",
            "role": "Housekeeping",
            "user_id": "00000000-0000-0000-0000-000000000003",
        }
    )
    return {"Authorization": f"Bearer {token}"}
