import datetime
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from server.config import settings

# Use SQLite check_same_thread=False for local/test SQLite databases
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models here to ensure they are registered on Base.metadata

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.lockout import LockoutState
    from server.models.user import User
    from server.utils.security import get_password_hash

    # Seed regular user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            id=uuid.uuid4(),
            username="testuser",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            phone_number="+15551234567",
            totp_secret="JBSWY3DPEHPK3PXP",  # Example base32 secret
            is_locked=False,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(test_user)
        db.flush()

        # Create lockout state
        lockout = LockoutState(
            id=uuid.uuid4(),
            user_id=test_user.id,
            failed_attempts=0,
            login_flow_restarts=0,
            otp_resends=0,
            otp_failures=0,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(lockout)
        db.commit()
    else:
        # Ensure lockout state exists
        lockout = (
            db.query(LockoutState).filter(LockoutState.user_id == test_user.id).first()
        )
        if not lockout:
            lockout = LockoutState(
                id=uuid.uuid4(),
                user_id=test_user.id,
                failed_attempts=0,
                login_flow_restarts=0,
                otp_resends=0,
                otp_failures=0,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(lockout)
            db.commit()

    # Seed admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            id=uuid.uuid4(),
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            phone_number="+15557654321",
            totp_secret="MZXW6YTBOI======",  # Example base32 secret
            is_locked=False,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(admin_user)
        db.flush()

        # Create lockout state
        lockout_admin = LockoutState(
            id=uuid.uuid4(),
            user_id=admin_user.id,
            failed_attempts=0,
            login_flow_restarts=0,
            otp_resends=0,
            otp_failures=0,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(lockout_admin)
        db.commit()
    else:
        # Ensure lockout state exists
        lockout_admin = (
            db.query(LockoutState).filter(LockoutState.user_id == admin_user.id).first()
        )
        if not lockout_admin:
            lockout_admin = LockoutState(
                id=uuid.uuid4(),
                user_id=admin_user.id,
                failed_attempts=0,
                login_flow_restarts=0,
                otp_resends=0,
                otp_failures=0,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(lockout_admin)
            db.commit()
