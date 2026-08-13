import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hotel.db")

# SQLite needs connect_args for multithreading
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from server.models import Base

    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User
    from server.auth import get_password_hash

    # Seed Admin User
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="System Admin",
            role="Admin",
            is_active=True,
        )
        db.add(admin)

    # Seed Regular Front Desk User
    front_desk = db.query(User).filter(User.email == "test@example.com").first()
    if not front_desk:
        front_desk = User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Front Desk Staff",
            role="Front Desk Staff",
            is_active=True,
        )
        db.add(front_desk)

    # Seed Housekeeping User
    housekeeping = (
        db.query(User).filter(User.email == "housekeeping@example.com").first()
    )
    if not housekeeping:
        housekeeping = User(
            email="housekeeping@example.com",
            hashed_password=get_password_hash("housekeepingpassword"),
            full_name="Housekeeping Staff",
            role="Housekeeping",
            is_active=True,
        )
        db.add(housekeeping)

    try:
        db.commit()
    except Exception:
        db.rollback()
