import os
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db: Session) -> None:
    """Seed ready-to-use initial accounts and test data idempotently."""
    # Local import to avoid circular dependencies
    from server.models import Account

    initial_accounts = [
        {
            "id": "usr_12345",
            "balance": 25000.00,
            "email": "usr_12345@example.com",
            "role": "user",
        },
        {
            "id": "usr_98765",
            "balance": 1000.00,
            "email": "usr_98765@example.com",
            "role": "user",
        },
        {
            "id": "test_sender_low_balance",
            "balance": 50.00,
            "email": "low_balance@example.com",
            "role": "user",
        },
        {
            "id": "test@example.com",
            "balance": 25000.00,
            "email": "test@example.com",
            "role": "user",
        },
        {
            "id": "admin@example.com",
            "balance": 50000.00,
            "email": "admin@example.com",
            "role": "admin",
        },
    ]

    for acc_data in initial_accounts:
        try:
            existing = db.query(Account).filter(Account.id == acc_data["id"]).first()
            if not existing:
                account = Account(
                    id=acc_data["id"],
                    balance=acc_data["balance"],
                    email=acc_data["email"],
                    role=acc_data["role"],
                    is_active=True,
                    is_verified=True,
                )
                db.add(account)
                db.commit()
            else:
                # Ensure balance is refreshed to at least the seed amount if needed
                if existing.balance < acc_data["balance"] and acc_data["id"] in [
                    "usr_12345",
                    "test_sender_low_balance",
                ]:
                    existing.balance = acc_data["balance"]
                    db.commit()
        except IntegrityError:
            db.rollback()
        except Exception as e:
            db.rollback()
            logger.warning(f"Error seeding account {acc_data['id']}: {e}")


def init_db() -> None:
    """Initialize database schema and seed initial data."""
    # Import all models to ensure they are registered on Base.metadata
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_data(db)
