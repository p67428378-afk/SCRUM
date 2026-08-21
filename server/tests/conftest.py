import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import get_db, seed_data
from server.models import Base, User
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
    connection = engine.connect()
    transaction = connection.begin()
    db = TestingSessionLocal(bind=connection)

    yield db

    db.close()
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
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_seller(db_session):
    seller = db_session.query(User).filter(User.email == "admin@example.com").first()
    return seller


@pytest.fixture
def test_buyer(db_session):
    buyer = db_session.query(User).filter(User.email == "test@example.com").first()
    return buyer


@pytest.fixture
def seller_headers(test_seller):
    token = create_access_token(
        data={"sub": test_seller.email, "role": test_seller.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def buyer_headers(test_buyer):
    token = create_access_token(data={"sub": test_buyer.email, "role": test_buyer.role})
    return {"Authorization": f"Bearer {token}"}
