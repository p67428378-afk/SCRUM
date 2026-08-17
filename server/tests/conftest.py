import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from server.database import Base, get_db, seed_data
from server.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def _create_schema_once():
    # Import models to register them on Base.metadata
    Base.metadata.create_all(bind=engine)
    # Seed initial data for tests
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def _clean_tables():
    """Function-scoped: wipe DATA (not schema) between tests so state doesn't leak."""
    yield
    # We don't want to wipe the seeded artists, countries, venues, concerts, and ticket tiers
    # because our tests rely on them!
    # Instead, let's only wipe bookings, payments, and digital_tickets.
    with engine.begin() as conn:
        conn.execute(Base.metadata.tables["digital_tickets"].delete())
        conn.execute(Base.metadata.tables["payments"].delete())
        conn.execute(Base.metadata.tables["bookings"].delete())


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
