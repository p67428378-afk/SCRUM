import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import Base, get_db, seed_data
from server.main import app
from server.security import create_access_token
from server import models

# In-memory SQLite database for testing
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
def librarian_user(db_session):
    admin = (
        db_session.query(models.User)
        .filter(models.User.email == "admin@example.com")
        .first()
    )
    return admin


@pytest.fixture
def member_user(db_session):
    member = (
        db_session.query(models.User)
        .filter(models.User.email == "test@example.com")
        .first()
    )
    return member


@pytest.fixture
def librarian_headers(librarian_user):
    token = create_access_token(data={"sub": librarian_user.id, "role": "Librarian"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def member_headers(member_user):
    token = create_access_token(data={"sub": member_user.id, "role": "Member"})
    return {"Authorization": f"Bearer {token}"}
