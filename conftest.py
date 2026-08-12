import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["TESTING"] = "true"

import server.database
from server.database import Base, get_db, seed_data
from server.models import User, Task  # noqa: F401 - ensure models register on Base
from server.main import app
from server.auth import create_access_token, get_password_hash

# SQLite in-memory test engine with StaticPool
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override engine and SessionLocal in server.database so background tasks use test DB
server.database.engine = engine
server.database.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
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


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def test_user(db_session):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            id="00000000-0000-0000-0000-000000000001",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            role="user",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def alt_user(db_session):
    user = db_session.query(User).filter(User.email == "altuser@example.com").first()
    if not user:
        user = User(
            id="00000000-0000-0000-0000-000000000003",
            email="altuser@example.com",
            hashed_password=get_password_hash("altpassword"),
            role="user",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(
        data={"sub": test_user.id, "email": test_user.email, "role": test_user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def alt_auth_headers(alt_user):
    token = create_access_token(
        data={"sub": alt_user.id, "email": alt_user.email, "role": alt_user.role}
    )
    return {"Authorization": f"Bearer {token}"}
