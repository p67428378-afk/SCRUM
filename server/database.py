import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
poolclass = StaticPool if "sqlite" in DATABASE_URL else None

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=poolclass,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User
    from server.security import get_password_hash

    # Seed Manager
    manager = db.query(User).filter(User.email == "manager@example.com").first()
    if not manager:
        manager = User(
            email="manager@example.com",
            hashed_password=get_password_hash("managerpassword"),
            full_name="Sarah Miller",
            role="Manager",
        )
        db.add(manager)
        try:
            db.commit()
            db.refresh(manager)
        except IntegrityError:
            db.rollback()
            manager = db.query(User).filter(User.email == "manager@example.com").first()

    # Seed Regular Employee
    employee = db.query(User).filter(User.email == "test@example.com").first()
    if not employee:
        employee = User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="John Doe",
            role="Employee",
            manager_id=manager.id if manager else None,
        )
        db.add(employee)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()

    # Seed Admin
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="HR Admin",
            role="Admin",
        )
        db.add(admin)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
