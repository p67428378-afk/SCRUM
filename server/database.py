import os
import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables idempotently."""
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session = None) -> None:
    """Seed default test accounts idempotently."""
    from server.models import User
    from server.auth import get_password_hash

    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Seed regular user
        regular_user = db.query(User).filter(User.email == "test@example.com").first()
        if not regular_user:
            regular_user = User(
                id=str(uuid.UUID("00000000-0000-0000-0000-000000000001")),
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                role="user",
                is_active=True,
                is_verified=True,
            )
            db.add(regular_user)

        # Seed admin user
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.UUID("00000000-0000-0000-0000-000000000002")),
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)

        db.commit()
    except IntegrityError:
        db.rollback()
    except Exception:
        db.rollback()
    finally:
        if should_close:
            db.close()
