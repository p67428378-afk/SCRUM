import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from server.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(engine_instance=None):
    from server.models import user, project, task, comment  # noqa: F401

    target_engine = engine_instance or engine
    Base.metadata.create_all(bind=target_engine)


def seed_data(db: Session):
    from server.models.user import User
    from server.core.security import get_password_hash

    # Seed regular member user
    try:
        user_member = db.query(User).filter(User.email == "test@example.com").first()
        if not user_member:
            user_member = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test User",
                role="Member",
                is_active=True,
            )
            db.add(user_member)
            db.commit()
            db.refresh(user_member)
    except IntegrityError:
        db.rollback()

    # Seed admin user
    try:
        user_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not user_admin:
            user_admin = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Admin User",
                role="Admin",
                is_active=True,
            )
            db.add(user_admin)
            db.commit()
            db.refresh(user_admin)
    except IntegrityError:
        db.rollback()
