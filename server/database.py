from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from server.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

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
    Base.metadata.create_all(bind=engine)
    seed_data()


def seed_data():
    from server import models
    from server.core.auth import get_password_hash

    db = SessionLocal()
    try:
        # Seed test user
        test_user = (
            db.query(models.User)
            .filter(models.User.email == "test@example.com")
            .first()
        )
        if not test_user:
            test_user = models.User(
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test Doctor",
                role="Doctor",
                is_active=True,
                is_verified=True,
            )
            db.add(test_user)

        # Seed admin user
        admin_user = (
            db.query(models.User)
            .filter(models.User.email == "admin@example.com")
            .first()
        )
        if not admin_user:
            admin_user = models.User(
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="System Admin",
                role="Admin",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)

        # Seed receptionist user
        rec_user = (
            db.query(models.User)
            .filter(models.User.email == "receptionist@example.com")
            .first()
        )
        if not rec_user:
            rec_user = models.User(
                email="receptionist@example.com",
                hashed_password=get_password_hash("recpassword"),
                full_name="Clinic Receptionist",
                role="Receptionist",
                is_active=True,
                is_verified=True,
            )
            db.add(rec_user)

        # Seed nurse user
        nurse_user = (
            db.query(models.User)
            .filter(models.User.email == "nurse@example.com")
            .first()
        )
        if not nurse_user:
            nurse_user = models.User(
                email="nurse@example.com",
                hashed_password=get_password_hash("nursepassword"),
                full_name="Clinic Nurse",
                role="Nurse",
                is_active=True,
                is_verified=True,
            )
            db.add(nurse_user)

        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
