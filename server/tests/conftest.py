import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.database import Base, get_db, seed_data
from server.main import app

# Use SQLite in-memory for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    import server.utils.audit

    server.utils.audit._test_db_session = session

    yield session

    server.utils.audit._test_db_session = None
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(autouse=True)
def reset_states(db_session):
    from server.models.lockout import LockoutState
    from server.models.session import UserSession
    from server.models.user import User
    from server.routers.auth import global_failed_attempts, ip_attempts
    from server.utils.audit import clear_audit_logs
    from server.utils.notifications import clear_notifications

    # Clear in-memory states
    ip_attempts.clear()
    global_failed_attempts.clear()
    clear_notifications()
    clear_audit_logs()

    # Delete all sessions
    db_session.query(UserSession).delete()

    # Reset lockout states
    lockouts = db_session.query(LockoutState).all()
    for l in lockouts:
        l.failed_attempts = 0
        l.login_flow_restarts = 0
        l.otp_resends = 0
        l.otp_failures = 0
        l.otp_code = None
        l.otp_expires_at = None
        l.last_failed_at = None
        l.last_restart_at = None
        l.last_otp_resend_at = None

    # Unlock all users
    users = db_session.query(User).all()
    for u in users:
        u.is_locked = False
        u.locked_until = None

    db_session.commit()


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
