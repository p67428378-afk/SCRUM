import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./expense_tracker.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(bind_engine=None):
    target_engine = bind_engine or engine
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=target_engine)


def seed_data(db):
    from server.models import Category
    import uuid

    default_categories = [
        {"name": "Food", "type": "expense", "is_predefined": True},
        {"name": "Transport", "type": "expense", "is_predefined": True},
        {"name": "Utilities", "type": "expense", "is_predefined": True},
        {"name": "Entertainment", "type": "expense", "is_predefined": True},
        {"name": "Income", "type": "income", "is_predefined": True},
        {"name": "Salary", "type": "income", "is_predefined": True},
    ]

    for cat_data in default_categories:
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing:
            cat = Category(
                id=str(uuid.uuid4()),
                name=cat_data["name"],
                type=cat_data["type"],
                is_predefined=cat_data["is_predefined"],
            )
            db.add(cat)
    try:
        db.commit()
    except Exception:
        db.rollback()
