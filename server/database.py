import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./expenses.db")

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


PREDEFINED_CATEGORIES = [
    {"name": "Food", "type": "expense", "is_predefined": True},
    {"name": "Transport", "type": "expense", "is_predefined": True},
    {"name": "Utilities", "type": "expense", "is_predefined": True},
    {"name": "Entertainment", "type": "expense", "is_predefined": True},
    {"name": "Housing", "type": "expense", "is_predefined": True},
    {"name": "Healthcare", "type": "expense", "is_predefined": True},
    {"name": "Salary", "type": "income", "is_predefined": True},
    {"name": "Freelance", "type": "income", "is_predefined": True},
    {"name": "Investments", "type": "income", "is_predefined": True},
    {"name": "Other", "type": "both", "is_predefined": True},
]


def init_db():
    from server.models import Category, Transaction  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import Category

    for cat in PREDEFINED_CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat["name"]).first()
        if not existing:
            new_cat = Category(
                name=cat["name"],
                type=cat["type"],
                is_predefined=cat["is_predefined"],
            )
            db.add(new_cat)
    try:
        db.commit()
    except Exception:
        db.rollback()
