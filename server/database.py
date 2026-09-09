import os
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./library.db")

# SQLite connection args
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(engine_override=None):
    target_engine = engine_override or engine
    # Import models here to make sure they are registered on Base.metadata
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=target_engine)


def seed_data(db: Session):
    from server.models import User, Book, Loan  # noqa: F401

    # 1. Seed Admin User
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        try:
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                hashed_password=pwd_context.hash("adminpassword"),
                full_name="Admin User",
                role="admin",
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        except IntegrityError:
            db.rollback()

    # 2. Seed Patron User
    patron = db.query(User).filter(User.email == "test@example.com").first()
    if not patron:
        try:
            patron_user = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                hashed_password=pwd_context.hash("testpassword"),
                full_name="Test Patron",
                role="patron",
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(patron_user)
            db.commit()
            db.refresh(patron_user)
        except IntegrityError:
            db.rollback()

    # 3. Seed Initial Books
    initial_books = [
        {
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "genre": "Software Engineering",
            "total_copies": 5,
            "available_copies": 5,
        },
        {
            "title": "Designing Data-Intensive Applications",
            "author": "Martin Kleppmann",
            "isbn": "9781449373320",
            "genre": "Computer Science",
            "total_copies": 3,
            "available_copies": 3,
        },
        {
            "title": "The Pragmatic Programmer",
            "author": "Andrew Hunt & David Thomas",
            "isbn": "9780201616224",
            "genre": "Software Engineering",
            "total_copies": 4,
            "available_copies": 4,
        },
        {
            "title": "To Kill a Mockingbird",
            "author": "Harper Lee",
            "isbn": "9780061120084",
            "genre": "Fiction",
            "total_copies": 2,
            "available_copies": 2,
        },
        {
            "title": "1984",
            "author": "George Orwell",
            "isbn": "9780451524935",
            "genre": "Dystopian",
            "total_copies": 3,
            "available_copies": 3,
        },
    ]

    for book_data in initial_books:
        existing = db.query(Book).filter(Book.isbn == book_data["isbn"]).first()
        if not existing:
            try:
                book = Book(
                    id=str(uuid.uuid4()),
                    title=book_data["title"],
                    author=book_data["author"],
                    isbn=book_data["isbn"],
                    genre=book_data["genre"],
                    total_copies=book_data["total_copies"],
                    available_copies=book_data["available_copies"],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                db.add(book)
                db.commit()
            except IntegrityError:
                db.rollback()
