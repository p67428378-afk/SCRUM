import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from server.config import settings

DATABASE_URL = settings.DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.models import Book

    if db.query(Book).first() is not None:
        return

    sample_books = [
        Book(
            id=str(uuid.uuid4()),
            title="Clean Code",
            author="Robert C. Martin",
            isbn="978-0132350884",
            category="Software Engineering",
            publication_year=2008,
            price=39.99,
            stock_quantity=15,
            description="A Handbook of Agile Software Craftsmanship",
        ),
        Book(
            id=str(uuid.uuid4()),
            title="The Pragmatic Programmer",
            author="Andrew Hunt, David Thomas",
            isbn="978-0201616224",
            category="Software Engineering",
            publication_year=1999,
            price=49.99,
            stock_quantity=8,
            description="Your Journey to Mastery",
        ),
        Book(
            id=str(uuid.uuid4()),
            title="Design Patterns",
            author="Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
            isbn="978-0201633610",
            category="Software Engineering",
            publication_year=1994,
            price=54.99,
            stock_quantity=0,
            description="Elements of Reusable Object-Oriented Software",
        ),
    ]
    try:
        db.add_all(sample_books)
        db.commit()
    except Exception:
        db.rollback()
