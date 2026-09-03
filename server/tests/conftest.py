import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.main import app
from server.database import get_db, seed_data
from server.models import Base
from server.auth import create_access_token

# Test SQLite in-memory engine with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def owner_headers(db_session):
    from server.models import User

    user = db_session.query(User).filter(User.email == "test@example.com").first()
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def designer_headers(db_session):
    from server.models import User

    user = db_session.query(User).filter(User.email == "designer@example.com").first()
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(db_session):
    from server.models import User

    user = db_session.query(User).filter(User.email == "admin@example.com").first()
    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    return {"Authorization": f"Bearer {token}"}
