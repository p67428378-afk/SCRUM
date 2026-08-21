import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cat_marketplace.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Use StaticPool only for in-memory SQLite to support multi-threaded TestClient
poolclass = StaticPool if DATABASE_URL == "sqlite:///:memory:" else None

engine = create_engine(DATABASE_URL, connect_args=connect_args, poolclass=poolclass)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db):
    from server.models import User
    from server.auth import get_password_hash
    from sqlalchemy.exc import IntegrityError

    users_to_seed = [
        {
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test Seller",
            "role": "seller",
        },
        {
            "email": "buyer@example.com",
            "password": "buyerpassword",
            "full_name": "Test Buyer",
            "role": "buyer",
        },
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "Admin Seller",
            "role": "seller",
        },
    ]

    for u in users_to_seed:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if existing:
            continue

        hashed = get_password_hash(u["password"])
        db_user = User(
            email=u["email"],
            hashed_password=hashed,
            full_name=u["full_name"],
            role=u["role"],
        )
        db.add(db_user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
