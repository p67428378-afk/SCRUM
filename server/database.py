import os
import uuid
from decimal import Decimal
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def init_db() -> None:
    # Import all models so metadata is populated
    import server.models.transfer  # noqa: F401
    import server.models.account  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session) -> None:
    from server.models.account import User, Account

    # Test user 1
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            id=uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test User",
            is_active=True,
            is_verified=True,
            role="user",
        )
        db.add(test_user)
        try:
            db.flush()
        except Exception:
            db.rollback()
            test_user = db.query(User).filter(User.email == "test@example.com").first()

    if test_user:
        acc1 = db.query(Account).filter(Account.user_id == test_user.id).first()
        if not acc1:
            acc1 = Account(
                id=test_user.id,  # Match user id for easy P2P lookup
                user_id=test_user.id,
                account_number="ACC-1001",
                balance=Decimal("25000.00"),
                currency="USD",
                status="ACTIVE",
            )
            db.add(acc1)

    # Test user 2 (Receiver)
    receiver_user = db.query(User).filter(User.email == "receiver@example.com").first()
    if not receiver_user:
        receiver_user = User(
            id=uuid.UUID(
                "b1ffcd00-1d1c-5fg9-cc7e-7cc0ce491b22".replace("g", "a")
            ),  # ensure valid hex uuid: b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22
            email="receiver@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Jane Receiver",
            is_active=True,
            is_verified=True,
            role="user",
        )
        db.add(receiver_user)
        try:
            db.flush()
        except Exception:
            db.rollback()
            receiver_user = (
                db.query(User).filter(User.email == "receiver@example.com").first()
            )

    if receiver_user:
        acc2 = db.query(Account).filter(Account.user_id == receiver_user.id).first()
        if not acc2:
            acc2 = Account(
                id=receiver_user.id,
                user_id=receiver_user.id,
                account_number="ACC-1002",
                balance=Decimal("1500.00"),
                currency="USD",
                status="ACTIVE",
            )
            db.add(acc2)

    # Admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin User",
            is_active=True,
            is_verified=True,
            role="admin",
        )
        db.add(admin_user)
        try:
            db.flush()
        except Exception:
            db.rollback()
            admin_user = (
                db.query(User).filter(User.email == "admin@example.com").first()
            )

    try:
        db.commit()
    except Exception:
        db.rollback()
