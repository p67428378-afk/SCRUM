import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
IS_TESTING = (
    os.getenv("TESTING", "").lower() == "true"
    or "memory" in DATABASE_URL
    or DATABASE_URL == "sqlite:///:memory:"
)

connect_args = {}
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite") or IS_TESTING:
    connect_args["check_same_thread"] = False
    if IS_TESTING:
        DATABASE_URL = "sqlite:///:memory:"
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
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
    Base.metadata.create_all(bind=engine)


def seed_data(db=None):
    from passlib.context import CryptContext
    from server.models.models import User, Product
    import uuid

    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True

    try:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

        # Seed Test User
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if not existing_user:
            user = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                full_name="Test User",
                hashed_password=pwd_context.hash("testpassword"),
                is_active=True,
            )
            db.add(user)

        # Seed Admin User
        existing_admin = (
            db.query(User).filter(User.email == "admin@example.com").first()
        )
        if not existing_admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                full_name="Admin User",
                hashed_password=pwd_context.hash("adminpassword"),
                is_active=True,
                role="admin",
            )
            db.add(admin)

        # Seed Sample Products if empty
        if db.query(Product).count() == 0:
            p1 = Product(
                id=str(uuid.uuid4()),
                name="Classic Denim Trucker Jacket",
                description="High quality durable denim jacket with vintage finish.",
                price=89.99,
                category="Outerwear",
                image_url="https://images.unsplash.com/photo-1576995853123-5a10305d93c0",
                in_stock=True,
                stock_quantity=25,
            )
            p2 = Product(
                id=str(uuid.uuid4()),
                name="Organic Cotton Tee",
                description="Soft, breathable 100% organic cotton daily t-shirt.",
                price=29.99,
                category="Apparel",
                image_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
                in_stock=True,
                stock_quantity=50,
            )
            p3 = Product(
                id=str(uuid.uuid4()),
                name="Leather Crossbody Bag",
                description="Handcrafted genuine leather bag with adjustable strap.",
                price=119.99,
                category="Accessories",
                image_url="https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
                in_stock=True,
                stock_quantity=15,
            )
            db.add_all([p1, p2, p3])

        db.commit()
    except Exception:
        db.rollback()
    finally:
        if close_after:
            db.close()
