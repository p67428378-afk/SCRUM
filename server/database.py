import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


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
    from server.models import User, Genre
    from server.services.auth import get_password_hash

    try:
        # Seed default genres
        default_genres = [
            "Action",
            "Sci-Fi",
            "Drama",
            "Comedy",
            "Horror",
            "Thriller",
            "Animation",
        ]
        for g_name in default_genres:
            existing_genre = db.query(Genre).filter(Genre.name == g_name).first()
            if not existing_genre:
                db.add(Genre(name=g_name))

        # Seed regular user
        user_email = "test@example.com"
        existing_user = db.query(User).filter(User.email == user_email).first()
        if not existing_user:
            user = User(
                email=user_email,
                hashed_password=get_password_hash("testpassword"),
                role="user",
                is_active=True,
            )
            db.add(user)

        # Seed admin user
        admin_email = "admin@example.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("adminpassword"),
                role="admin",
                is_active=True,
            )
            db.add(admin)

        db.commit()
    except Exception:
        db.rollback()
