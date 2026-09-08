import os
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


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
    from server.models import User, Category, Book, Cart

    # 1. Seed regular test user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        test_user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Alex Morgan",
            role="user",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(test_user)
        db.flush()
        # Create an active cart for test user
        user_cart = Cart(
            id=str(uuid.uuid4()),
            user_id=test_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(user_cart)

    # 2. Seed admin test user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Manager",
            role="admin",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(admin_user)
        db.flush()
        admin_cart = Cart(
            id=str(uuid.uuid4()),
            user_id=admin_user.id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(admin_cart)

    # 3. Seed Categories
    categories_data = [
        {
            "name": "Technology",
            "description": "Software development, computer science, and engineering.",
        },
        {
            "name": "Fiction",
            "description": "Novels, stories, literature, and speculative fiction.",
        },
        {
            "name": "Science",
            "description": "Physics, astronomy, biology, and popular science.",
        },
        {
            "name": "Business",
            "description": "Economics, entrepreneurship, and leadership.",
        },
    ]

    category_map = {}
    for cat_data in categories_data:
        cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not cat:
            cat = Category(
                id=str(uuid.uuid4()),
                name=cat_data["name"],
                description=cat_data["description"],
                created_at=datetime.now(timezone.utc),
            )
            db.add(cat)
            db.flush()
        category_map[cat.name] = cat.id

    # 4. Seed Books
    books_data = [
        {
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "isbn": "978-0132350884",
            "category_name": "Technology",
            "price": 29.99,
            "stock_quantity": 15,
            "rating": 4.8,
            "summary": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Learn how to write agile, robust software with clean code principles.",
            "cover_image": "https://images.unsplash.com/photo-1532012164546-f432f2e3edd1?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "The Pragmatic Programmer: Your Journey to Mastery",
            "author": "David Thomas, Andrew Hunt",
            "isbn": "978-0135957059",
            "category_name": "Technology",
            "price": 34.50,
            "stock_quantity": 20,
            "rating": 4.9,
            "summary": "The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process of crafting good code.",
            "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "Python Crash Course: A Hands-On, Project-Based Introduction",
            "author": "Eric Matthes",
            "isbn": "978-1593279288",
            "category_name": "Technology",
            "price": 24.95,
            "stock_quantity": 12,
            "rating": 4.7,
            "summary": "A fast-paced, no-nonsense guide to programming in Python that will have you writing programs, solving problems, and making things that work in no time.",
            "cover_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "Dune",
            "author": "Frank Herbert",
            "isbn": "978-0441172719",
            "category_name": "Fiction",
            "price": 14.99,
            "stock_quantity": 25,
            "rating": 4.8,
            "summary": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who will become the mysterious man known as Muad'Dib.",
            "cover_image": "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "Project Hail Mary",
            "author": "Andy Weir",
            "isbn": "978-0593135204",
            "category_name": "Fiction",
            "price": 18.99,
            "stock_quantity": 8,
            "rating": 4.9,
            "summary": "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed.",
            "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "A Brief History of Time",
            "author": "Stephen Hawking",
            "isbn": "978-0553380163",
            "category_name": "Science",
            "price": 16.50,
            "stock_quantity": 10,
            "rating": 4.6,
            "summary": "A landmark volume in science writing by one of the great minds of our time, Stephen Hawking explores the frontiers of space and time.",
            "cover_image": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "Designing Data-Intensive Applications",
            "author": "Martin Kleppmann",
            "isbn": "978-1449373320",
            "category_name": "Technology",
            "price": 39.99,
            "stock_quantity": 18,
            "rating": 4.9,
            "summary": "Data is at the center of many challenges in system design today. Explore the principles and architectures underpinning modern distributed data systems.",
            "cover_image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
        },
        {
            "title": "Zero to One: Notes on Startups, or How to Build the Future",
            "author": "Peter Thiel, Blake Masters",
            "isbn": "978-0804139298",
            "category_name": "Business",
            "price": 21.00,
            "stock_quantity": 14,
            "rating": 4.5,
            "summary": "The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.",
            "cover_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
        },
    ]

    for b_data in books_data:
        cat_id = category_map.get(b_data["category_name"])
        existing_book = db.query(Book).filter(Book.isbn == b_data["isbn"]).first()
        if not existing_book and cat_id:
            book = Book(
                id=str(uuid.uuid4()),
                title=b_data["title"],
                author=b_data["author"],
                isbn=b_data["isbn"],
                category_id=cat_id,
                price=b_data["price"],
                stock_quantity=b_data["stock_quantity"],
                rating=b_data["rating"],
                summary=b_data["summary"],
                cover_image=b_data["cover_image"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(book)

    try:
        db.commit()
    except Exception:
        db.rollback()
