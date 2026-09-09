import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from server.app.core.database import Base, get_db
from server.app.models.account import Account
from server.app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
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
    """Wipe data and reseed test accounts before each test."""
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())

    db = TestingSessionLocal()
    sender = Account(
        id="550e8400-e29b-41d4-a716-446655440000",
        account_number="ACC-SENDER-01",
        balance=Decimal("12450.00"),
        currency="USD",
    )
    receiver = Account(
        id="6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        account_number="ACC-RECEIVER-01",
        balance=Decimal("1000.00"),
        currency="USD",
    )
    poor_sender = Account(
        id="11111111-1111-1111-1111-111111111111",
        account_number="ACC-POOR-01",
        balance=Decimal("100.00"),
        currency="USD",
    )
    rich_sender = Account(
        id="22222222-2222-2222-2222-222222222222",
        account_number="ACC-RICH-01",
        balance=Decimal("50000.00"),
        currency="USD",
    )
    db.add_all([sender, receiver, poor_sender, rich_sender])
    db.commit()
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
    with TestClient(app) as test_client:
        yield test_client
