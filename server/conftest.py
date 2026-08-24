import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import server.database
import server.main
from server.database import get_db, seed_data
from server.models.models import (
    Base,
    CartItem,
    Order,
    OrderItem,
    Reward,
    UserActivityLog,
    UserLoginStats,
    WishlistItem,
)
from server.main import app

# In-memory SQLite for test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override SessionLocal so middleware in main.py uses test db in test session
server.database.SessionLocal = TestingSessionLocal
server.main.SessionLocal = TestingSessionLocal


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def clean_db_between_tests():
    """Wipe user-created table data between test functions for clean isolation."""
    db = TestingSessionLocal()
    try:
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(CartItem).delete()
        db.query(WishlistItem).delete()
        db.query(Reward).delete()
        db.query(UserActivityLog).delete()
        db.query(UserLoginStats).delete()
        db.commit()
    finally:
        db.close()
    yield
    db = TestingSessionLocal()
    try:
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(CartItem).delete()
        db.query(WishlistItem).delete()
        db.query(Reward).delete()
        db.query(UserActivityLog).delete()
        db.query(UserLoginStats).delete()
        db.commit()
    finally:
        db.close()


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
