import pytest
from fastapi.testclient import TestClient
from server.config import settings

# Force testing mode BEFORE importing database modules
settings.TESTING = True
settings.DATABASE_URL = "sqlite:///:memory:"

from server.database import Base, engine, SessionLocal, get_db  # noqa: E402
from server.main import app  # noqa: E402


@pytest.fixture(scope="function")
def db():
    # Create tables on the shared engine
    Base.metadata.create_all(bind=engine)
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
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
