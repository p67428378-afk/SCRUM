import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=StaticPool if DATABASE_URL.startswith("sqlite") else None,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    import server.models  # noqa: F401 - ensure models register on Base.metadata

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    from server.models import User

    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            full_name="Platform Admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)

    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            email="test@example.com",
            full_name="Test User",
            is_active=True,
            is_verified=True,
        )
        db.add(user)

    db.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
