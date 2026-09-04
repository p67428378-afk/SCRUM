import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.database import Base, get_db, seed_data
from server.models import User  # Ensure models loaded
from server.main import app
from server.auth import create_access_token

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def _get_test_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def user_token_headers(db_session):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_token_headers(db_session):
    admin = db_session.query(User).filter(User.email == "admin@example.com").first()
    token = create_access_token(data={"sub": admin.id, "role": admin.role})
    return {"Authorization": f"Bearer {token}"}
