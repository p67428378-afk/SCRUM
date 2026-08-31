import pytest
from datetime import datetime, timezone
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.main import app
from server.db.session import Base, get_db, seed_data
import server.models.user  # noqa: F401
import server.models.project  # noqa: F401
import server.models.task  # noqa: F401
import server.models.comment  # noqa: F401
import server.models.escalation  # noqa: F401
from server.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def clean_db():
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
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db_session):
    from server.models.user import User
    from server.core.security import get_password_hash

    admin = db_session.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            full_name="Admin Test",
            hashed_password=get_password_hash("adminpassword"),
            role="Admin",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db_session.add(admin)
        db_session.commit()
        db_session.refresh(admin)
    return admin


@pytest.fixture
def member_user(db_session):
    from server.models.user import User
    from server.core.security import get_password_hash

    member = db_session.query(User).filter(User.email == "test@example.com").first()
    if not member:
        member = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            full_name="Member Test",
            hashed_password=get_password_hash("testpassword"),
            role="Member",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db_session.add(member)
        db_session.commit()
        db_session.refresh(member)
    return member


@pytest.fixture
def member_auth_headers(member_user):
    token = create_access_token(subject=member_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(admin_user):
    token = create_access_token(subject=admin_user.id)
    return {"Authorization": f"Bearer {token}"}
