import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import Base, get_db, seed_data
import server.models  # noqa: F401
from server.main import app
from server.auth import create_access_token

# Single shared in-memory SQLite engine for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def user_token(db):
    from server.models import User

    user = db.query(User).filter(User.email == "test@example.com").first()
    token = create_access_token(
        data={"sub": user.id, "role": user.role, "email": user.email}
    )
    return token


@pytest.fixture
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_token(db):
    from server.models import User

    admin = db.query(User).filter(User.email == "admin@example.com").first()
    token = create_access_token(
        data={"sub": admin.id, "role": admin.role, "email": admin.email}
    )
    return token


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}
