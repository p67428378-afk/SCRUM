import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./library.db")

# For SQLite compatibility
connect_args = {}
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    if ":memory:" in DATABASE_URL:
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_db_initialized = False


def init_db():
    global _db_initialized
    Base.metadata.create_all(bind=engine)
    _db_initialized = True


def get_db():
    global _db_initialized
    if not _db_initialized:
        init_db()
        db = SessionLocal()
        try:
            seed_data(db)
        finally:
            db.close()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db):
    import server.models as models
    from server.security import get_password_hash
    from sqlalchemy.exc import IntegrityError

    # Seed Admin / Librarian
    admin = (
        db.query(models.User).filter(models.User.email == "admin@example.com").first()
    )
    if not admin:
        admin_user = models.User(
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Librarian",
            role=models.UserRole.LIBRARIAN,
            is_active=True,
        )
        db.add(admin_user)

    # Seed Regular Member
    member = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    if not member:
        member_user = models.User(
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Member",
            role=models.UserRole.MEMBER,
            is_active=True,
        )
        db.add(member_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # Seed sample books if empty
    book_count = db.query(models.Book).count()
    if book_count == 0:
        sample_books = [
            models.Book(
                title="Clean Code",
                author="Robert C. Martin",
                isbn="978-0132350884",
                genre="Software Engineering",
                total_copies=5,
                available_copies=5,
            ),
            models.Book(
                title="Design Patterns",
                author="Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
                isbn="978-0201633610",
                genre="Software Engineering",
                total_copies=3,
                available_copies=3,
            ),
            models.Book(
                title="The Pragmatic Programmer",
                author="Andrew Hunt, David Thomas",
                isbn="978-0201616224",
                genre="Software Engineering",
                total_copies=4,
                available_copies=4,
            ),
        ]
        db.add_all(sample_books)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
