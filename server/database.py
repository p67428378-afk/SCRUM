from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from server.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
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
    from server.models.user import User
    from server.security import get_password_hash
    from sqlalchemy.exc import IntegrityError

    # Seed regular user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        try:
            test_user = User(
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test User",
                is_active=True,
            )
            db.add(test_user)
            db.commit()
        except IntegrityError:
            db.rollback()

    # Seed admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        try:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Admin User",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
        except IntegrityError:
            db.rollback()
