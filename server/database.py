import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db):
    """Seed default categories, menu items, and test user accounts idempotently."""
    from server.models import User, Address, Category, MenuItem
    from server.auth import get_password_hash

    # 1. Seed Accounts
    # Test Customer Account
    customer = db.query(User).filter(User.email == "test@example.com").first()
    if not customer:
        customer = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Customer",
            phone="1234567890",
            role="CUSTOMER",
        )
        db.add(customer)
        try:
            db.commit()
            db.refresh(customer)
        except IntegrityError:
            db.rollback()
            customer = db.query(User).filter(User.email == "test@example.com").first()

    # Seed default address for customer if none exists
    if customer:
        existing_addr = db.query(Address).filter(Address.user_id == customer.id).first()
        if not existing_addr:
            addr = Address(
                id=str(uuid.uuid4()),
                user_id=customer.id,
                street_address="123 Hill Road, Bandra West",
                city="Mumbai",
                postal_code="400050",
                is_default=True,
            )
            db.add(addr)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # Admin / Staff Account
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Staff",
            phone="0987654321",
            role="ADMIN",
        )
        db.add(admin)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()

    # 2. Seed Categories
    categories_data = [
        {"name": "Appetizers", "display_order": 1},
        {"name": "Main Course", "display_order": 2},
        {"name": "Biryani & Rice", "display_order": 3},
        {"name": "Breads & Tandoor", "display_order": 4},
        {"name": "Desserts", "display_order": 5},
        {"name": "Beverages", "display_order": 6},
    ]

    cat_map = {}
    for cat_info in categories_data:
        cat = db.query(Category).filter(Category.name == cat_info["name"]).first()
        if not cat:
            cat = Category(
                id=str(uuid.uuid4()),
                name=cat_info["name"],
                display_order=cat_info["display_order"],
            )
            db.add(cat)
            try:
                db.commit()
                db.refresh(cat)
            except IntegrityError:
                db.rollback()
                cat = (
                    db.query(Category).filter(Category.name == cat_info["name"]).first()
                )
        cat_map[cat_info["name"]] = cat.id if cat else None

    # 3. Seed Menu Items
    menu_items_data = [
        {
            "category_name": "Main Course",
            "name": "Butter Chicken",
            "description": "Tender chicken cooked in rich tomato and butter gravy",
            "price": 14.99,
            "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
            "dietary_tags": "Non-Veg,Chef Special",
            "is_available": True,
        },
        {
            "category_name": "Biryani & Rice",
            "name": "Hyderabadi Dum Biryani",
            "description": "Fragrant basmati rice layered with spiced marinated chicken and herbs",
            "price": 12.50,
            "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
            "dietary_tags": "Non-Veg",
            "is_available": True,
        },
        {
            "category_name": "Main Course",
            "name": "Paneer Tikka Masala",
            "description": "Grilled cottage cheese cubes in spiced onion tomato gravy",
            "price": 13.99,
            "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
            "dietary_tags": "Veg",
            "is_available": True,
        },
        {
            "category_name": "Breads & Tandoor",
            "name": "Garlic Butter Naan",
            "description": "Soft unleavened bread baked in tandoor and brushed with garlic butter",
            "price": 3.50,
            "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950",
            "dietary_tags": "Veg",
            "is_available": True,
        },
        {
            "category_name": "Desserts",
            "name": "Gulab Jamun",
            "description": "Deep fried milk dumplings soaked in cardamom sugar syrup",
            "price": 4.99,
            "image_url": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
            "dietary_tags": "Veg",
            "is_available": True,
        },
        {
            "category_name": "Beverages",
            "name": "Mango Lassi",
            "description": "Refreshing chilled yogurt drink blended with sweet mango pulp",
            "price": 3.99,
            "image_url": "https://images.unsplash.com/photo-1571006682880-333036c64115",
            "dietary_tags": "Veg",
            "is_available": True,
        },
    ]

    for item_info in menu_items_data:
        cat_id = cat_map.get(item_info["category_name"])
        if cat_id:
            existing_item = (
                db.query(MenuItem).filter(MenuItem.name == item_info["name"]).first()
            )
            if not existing_item:
                item = MenuItem(
                    id=str(uuid.uuid4()),
                    category_id=cat_id,
                    name=item_info["name"],
                    description=item_info["description"],
                    price=item_info["price"],
                    image_url=item_info["image_url"],
                    dietary_tags=item_info["dietary_tags"],
                    is_available=item_info["is_available"],
                )
                db.add(item)
                try:
                    db.commit()
                except IntegrityError:
                    db.rollback()


def init_db():
    """Initialize database tables and seed initial data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
