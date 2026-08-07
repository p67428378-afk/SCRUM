import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.config import settings

# Determine database engine arguments
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
    # Import models here so Base metadata contains all tables
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models import User, Book, UserRole, UserStatus, BookStatus
    from server.auth import get_password_hash

    # Seed Admin / Librarian account
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            full_name="Admin Librarian",
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            role=UserRole.LIBRARIAN.value,
            status=UserStatus.ACTIVE.value,
            is_active=True,
        )
        db.add(admin)

    # Seed Test Patron account
    test_patron = db.query(User).filter(User.email == "test@example.com").first()
    if not test_patron:
        test_patron = User(
            id=str(uuid.uuid4()),
            full_name="Test Patron",
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            role=UserRole.PATRON.value,
            status=UserStatus.ACTIVE.value,
            is_active=True,
        )
        db.add(test_patron)

    # Seed Patron demo account
    patron_demo = db.query(User).filter(User.email == "patron@example.com").first()
    if not patron_demo:
        patron_demo = User(
            id=str(uuid.uuid4()),
            full_name="Patron User",
            email="patron@example.com",
            hashed_password=get_password_hash("patronpassword"),
            role=UserRole.PATRON.value,
            status=UserStatus.ACTIVE.value,
            is_active=True,
        )
        db.add(patron_demo)

    # Seed Sample Books if catalog is empty
    if db.query(Book).count() == 0:
        sample_books = [
            Book(
                id=str(uuid.uuid4()),
                title="The Pragmatic Programmer",
                author="Andy Hunt, Dave Thomas",
                category="Technology",
                isbn="978-0201616224",
                status=BookStatus.AVAILABLE.value,
            ),
            Book(
                id=str(uuid.uuid4()),
                title="Clean Code",
                author="Robert C. Martin",
                category="Technology",
                isbn="978-0132350884",
                status=BookStatus.AVAILABLE.value,
            ),
            Book(
                id=str(uuid.uuid4()),
                title="Design Patterns",
                author="Erich Gamma, et al.",
                category="Technology",
                isbn="978-0201633610",
                status=BookStatus.AVAILABLE.value,
            ),
            Book(
                id=str(uuid.uuid4()),
                title="The Mythical Man-Month",
                author="Frederick Brooks Jr.",
                category="Technology",
                isbn="978-0201835953",
                status=BookStatus.MAINTENANCE.value,
            ),
        ]
        for book in sample_books:
            db.add(book)

    try:
        db.commit()
    except Exception:
        db.rollback()
