import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/furniture_app.db")

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


def init_db(target_engine=None):
    """Create all database tables."""
    use_engine = target_engine or engine
    # Import models here to ensure they are registered with Base.metadata
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=use_engine)


def seed_data(db: Session):
    """Seed initial categories, products, and test accounts idempotently."""
    from server import models
    from server.auth import get_password_hash

    # Seed Users
    # 1. Regular test user
    test_user = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    if not test_user:
        test_user = models.User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Customer",
            role="customer",
            is_active=True,
            is_verified=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(test_user)
        try:
            db.commit()
            db.refresh(test_user)
        except Exception:
            db.rollback()
            test_user = (
                db.query(models.User)
                .filter(models.User.email == "test@example.com")
                .first()
            )

    # 2. Admin test user
    admin_user = (
        db.query(models.User).filter(models.User.email == "admin@example.com").first()
    )
    if not admin_user:
        admin_user = models.User(
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
        try:
            db.commit()
            db.refresh(admin_user)
        except Exception:
            db.rollback()

    # Seed Categories
    category_data = [
        {
            "name": "Living Room",
            "slug": "living-room",
            "description": "Sofas, coffee tables, armchairs, and living room furniture",
        },
        {
            "name": "Bedroom",
            "slug": "bedroom",
            "description": "Beds, dressers, nightstands, and bedroom essentials",
        },
        {
            "name": "Office",
            "slug": "office",
            "description": "Ergonomic desks, executive chairs, and office storage",
        },
        {
            "name": "Dining",
            "slug": "dining",
            "description": "Dining tables, dining chairs, buffets, and bar stools",
        },
    ]

    cat_map = {}
    for c_info in category_data:
        cat = (
            db.query(models.Category)
            .filter(models.Category.slug == c_info["slug"])
            .first()
        )
        if not cat:
            cat = models.Category(
                id=str(uuid.uuid4()),
                name=c_info["name"],
                slug=c_info["slug"],
                description=c_info["description"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(cat)
            try:
                db.commit()
                db.refresh(cat)
            except Exception:
                db.rollback()
                cat = (
                    db.query(models.Category)
                    .filter(models.Category.slug == c_info["slug"])
                    .first()
                )
        cat_map[c_info["slug"]] = cat

    # Seed Products
    sample_products = [
        {
            "name": "Nordic Velvet 3-Seater Sofa",
            "category_slug": "living-room",
            "description": "Luxurious Scandinavian design sofa crafted with high-density foam, solid oak frame, and premium velvet upholstery.",
            "price": 899.00,
            "material": "Velvet",
            "color": "Emerald Green",
            "finish_options": ["Natural Oak", "Dark Walnut", "Black Matte"],
            "dimension_options": ['Standard (84" W)', 'Large (96" W)'],
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 25,
        },
        {
            "name": "Minimalist Oak Coffee Table",
            "category_slug": "living-room",
            "description": "Handcrafted coffee table featuring clean geometric lines, lower storage shelf, and smooth chamfered edges.",
            "price": 349.00,
            "material": "Oak",
            "color": "Natural Oak",
            "finish_options": ["Natural Oak", "Bleached Oak", "Smoked Oak"],
            "dimension_options": ['Standard (42" L)', 'Compact (36" L)'],
            "rating": 4.6,
            "image_url": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 40,
        },
        {
            "name": "Modern Leather Accent Armchair",
            "category_slug": "living-room",
            "description": "Full-grain Italian leather armchair with polished bronze steel frame and deep ergonomic cushion.",
            "price": 620.00,
            "material": "Leather",
            "color": "Cognac Brown",
            "finish_options": ["Brushed Bronze", "Matte Black", "Chrome"],
            "dimension_options": ["Standard", "High Back"],
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1580481077194-a285d01247ff?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 18,
        },
        {
            "name": "Mid-Century Walnut Platform Bed",
            "category_slug": "bedroom",
            "description": "Solid American walnut platform bed with integrated headboard shelving and quiet wooden slat support.",
            "price": 1150.00,
            "material": "Walnut",
            "color": "Warm Walnut",
            "finish_options": ["Natural Walnut", "Espresso", "Honey Walnut"],
            "dimension_options": ["Queen", "King", "California King"],
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 15,
        },
        {
            "name": "6-Drawer Modern Dresser",
            "category_slug": "bedroom",
            "description": "Spacious bedroom dresser with soft-close undermount drawer slides and brushed brass hardware.",
            "price": 780.00,
            "material": "Walnut",
            "color": "Dark Walnut",
            "finish_options": ["Dark Walnut", "Natural Birch", "Charcoal"],
            "dimension_options": ['Standard (56" W)', 'Wide (66" W)'],
            "rating": 4.7,
            "image_url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 12,
        },
        {
            "name": "Ergonomic Solid Wood Executive Desk",
            "category_slug": "office",
            "description": "Premium solid wood office desk with integrated wire management channel and dual lockable drawers.",
            "price": 690.00,
            "material": "Oak",
            "color": "Smoked Gray",
            "finish_options": ["Smoked Gray", "Natural Oak", "Walnut"],
            "dimension_options": ['55" x 28"', '65" x 32"'],
            "rating": 4.8,
            "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 22,
        },
        {
            "name": "High-Back Mesh & Leather Office Chair",
            "category_slug": "office",
            "description": "Multi-adjustable ergonomic task chair with dynamic lumbar support, 3D armrests, and breathable mesh back.",
            "price": 380.00,
            "material": "Leather",
            "color": "Black",
            "finish_options": ["Black & Polished Chrome", "All Black"],
            "dimension_options": ["Standard"],
            "rating": 4.7,
            "image_url": "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 35,
        },
        {
            "name": "Extendable Solid Oak Dining Table",
            "category_slug": "dining",
            "description": "Extendable dining table seating 6 to 10 guests with seamless butterfly leaf extension mechanism.",
            "price": 950.00,
            "material": "Oak",
            "color": "Natural Oak",
            "finish_options": ["Natural Oak", "Dark Walnut", "Weathered Gray"],
            "dimension_options": ['72" to 96"', '84" to 108"'],
            "rating": 4.9,
            "image_url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 20,
        },
        {
            "name": "Curved Upholstered Dining Chair (Set of 2)",
            "category_slug": "dining",
            "description": "Pair of contemporary dining chairs with stain-resistant textured fabric and solid timber legs.",
            "price": 290.00,
            "material": "Fabric",
            "color": "Oatmeal Beige",
            "finish_options": ["Natural Oak Legs", "Walnut Legs", "Black Legs"],
            "dimension_options": ["Standard"],
            "rating": 4.6,
            "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
            "stock_quantity": 50,
        },
    ]

    for p_info in sample_products:
        existing = (
            db.query(models.Product)
            .filter(models.Product.name == p_info["name"])
            .first()
        )
        if not existing:
            cat = cat_map.get(p_info["category_slug"])
            cat_id = cat.id if cat else None
            prod = models.Product(
                id=str(uuid.uuid4()),
                category_id=cat_id,
                name=p_info["name"],
                description=p_info["description"],
                price=p_info["price"],
                material=p_info["material"],
                color=p_info["color"],
                finish_options=p_info["finish_options"],
                dimension_options=p_info["dimension_options"],
                rating=p_info["rating"],
                image_url=p_info["image_url"],
                stock_quantity=p_info["stock_quantity"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(prod)
            try:
                db.commit()
            except Exception:
                db.rollback()
