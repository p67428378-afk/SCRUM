import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/library.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models before creating tables
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models import User, Member, Book

    init_db()

    # 1. Admin User (admin@example.com)
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        try:
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="System Administrator",
                phone="555-0100",
                role="ADMIN",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        except IntegrityError:
            db.rollback()
            admin_user = (
                db.query(User).filter(User.email == "admin@example.com").first()
            )

    # 2. Staff User (staff@example.com)
    staff_user = db.query(User).filter(User.email == "staff@example.com").first()
    if not staff_user:
        try:
            staff_user = User(
                id=str(uuid.uuid4()),
                email="staff@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Library Staff",
                phone="555-0101",
                role="STAFF",
                is_active=True,
                is_verified=True,
            )
            db.add(staff_user)
            db.commit()
            db.refresh(staff_user)
        except IntegrityError:
            db.rollback()

    # 3. Patron User (test@example.com)
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        try:
            test_user = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test Patron",
                phone="555-0199",
                role="PATRON",
                is_active=True,
                is_verified=True,
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        except IntegrityError:
            db.rollback()
            test_user = db.query(User).filter(User.email == "test@example.com").first()

    if test_user:
        test_member = db.query(Member).filter(Member.user_id == test_user.id).first()
        if not test_member:
            try:
                test_member = Member(
                    id=str(uuid.uuid4()),
                    user_id=test_user.id,
                    membership_tier="STANDARD",
                    status="ACTIVE",
                    unpaid_fines=0.0,
                )
                db.add(test_member)
                db.commit()
            except IntegrityError:
                db.rollback()

    # 4. Sample Books
    sample_books = [
        {
            "isbn": "978-0137081073",
            "title": "The Clean Coder",
            "author": "Robert C. Martin",
            "category": "Technology",
            "total_copies": 5,
            "available_copies": 5,
        },
        {
            "isbn": "978-0132350884",
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "category": "Technology",
            "total_copies": 8,
            "available_copies": 8,
        },
        {
            "isbn": "978-0201633610",
            "title": "Design Patterns",
            "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
            "category": "Software Engineering",
            "total_copies": 4,
            "available_copies": 4,
        },
        {
            "isbn": "978-0134494166",
            "title": "Clean Architecture",
            "author": "Robert C. Martin",
            "category": "Architecture",
            "total_copies": 6,
            "available_copies": 6,
        },
    ]

    for b in sample_books:
        existing = db.query(Book).filter(Book.isbn == b["isbn"]).first()
        if not existing:
            try:
                new_book = Book(
                    id=str(uuid.uuid4()),
                    isbn=b["isbn"],
                    title=b["title"],
                    author=b["author"],
                    category=b["category"],
                    total_copies=b["total_copies"],
                    available_copies=b["available_copies"],
                )
                db.add(new_book)
                db.commit()
            except IntegrityError:
                db.rollback()
