import os
import uuid
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy.pool import StaticPool
from server.core.config import settings

DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL)

connect_args = {}
poolclass = None

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    if ":memory:" in DATABASE_URL:
        poolclass = StaticPool

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass if poolclass else None,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import all models before create_all
    import server.models.user  # noqa: F401
    import server.models.project  # noqa: F401
    import server.models.task  # noqa: F401
    import server.models.comment  # noqa: F401
    import server.models.escalation  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models.user import User
    from server.core.security import get_password_hash

    # Seed regular member user
    member = db.query(User).filter(User.email == "test@example.com").first()
    if not member:
        member = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            full_name="Test Member",
            hashed_password=get_password_hash("testpassword"),
            role="Member",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(member)

    # Seed admin user
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            full_name="System Admin",
            hashed_password=get_password_hash("adminpassword"),
            role="Admin",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(admin)

    try:
        db.commit()
    except Exception:
        db.rollback()
