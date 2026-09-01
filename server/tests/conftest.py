import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from server.database import Base, get_db
from server.main import app
from server import models
from server.core.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def seed_users(db):
    if (
        not db.query(models.User)
        .filter(models.User.email == "test@example.com")
        .first()
    ):
        t_user = models.User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Doctor",
            role="Doctor",
            is_active=True,
            is_verified=True,
        )
        db.add(t_user)

    if (
        not db.query(models.User)
        .filter(models.User.email == "admin@example.com")
        .first()
    ):
        a_user = models.User(
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="System Admin",
            role="Admin",
            is_active=True,
            is_verified=True,
        )
        db.add(a_user)

    if (
        not db.query(models.User)
        .filter(models.User.email == "receptionist@example.com")
        .first()
    ):
        r_user = models.User(
            email="receptionist@example.com",
            hashed_password=get_password_hash("recpassword"),
            full_name="Clinic Receptionist",
            role="Receptionist",
            is_active=True,
            is_verified=True,
        )
        db.add(r_user)

    db.commit()


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    seed_users(session)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
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
