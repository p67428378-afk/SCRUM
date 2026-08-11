import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.config import settings

# Engine configuration
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
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
    from server.models.product import Category, Product  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session = None):
    """Seed sample categories and products idempotently."""
    if db is None:
        db_gen = get_db()
        db = next(db_gen)
        should_close = True
    else:
        should_close = False

    try:
        from server.models.product import Category, Product

        # Seed categories if none exist
        existing_categories = db.query(Category).all()
        category_map = {c.slug: c for c in existing_categories}

        categories_data = [
            {"name": "Footwear", "slug": "footwear"},
            {"name": "Apparel", "slug": "apparel"},
            {"name": "Gear & Accessories", "slug": "gear"},
            {"name": "Electronics", "slug": "electronics"},
        ]

        for cat_info in categories_data:
            if cat_info["slug"] not in category_map:
                cat = Category(
                    id=str(uuid.uuid4()),
                    name=cat_info["name"],
                    slug=cat_info["slug"],
                )
                db.add(cat)
                db.flush()
                category_map[cat_info["slug"]] = cat

        # Seed products if none exist
        existing_products_count = db.query(Product).count()
        if existing_products_count == 0:
            products_data = [
                {
                    "title": "Nike Air Zoom Running Shoes",
                    "description": "High performance lightweight running shoes for road and trail.",
                    "price": 129.99,
                    "thumbnail_url": "https://example.com/running-shoes.jpg",
                    "tags": ["running", "shoes", "footwear", "nike", "sports"],
                    "category_slug": "footwear",
                },
                {
                    "title": "Adidas Ultraboost Running Shoes",
                    "description": "Comfortable cushioning running shoes with responsive boost midsole.",
                    "price": 149.99,
                    "thumbnail_url": "https://example.com/ultraboost.jpg",
                    "tags": ["running", "shoes", "footwear", "adidas", "marathon"],
                    "category_slug": "footwear",
                },
                {
                    "title": "Zip-up Hoodie",
                    "description": "Warm fleece zip-up hoodie sweater for cold weather.",
                    "price": 59.99,
                    "thumbnail_url": "https://example.com/hoodie.jpg",
                    "tags": ["hoodie", "apparel", "zip-up", "fleece", "warm"],
                    "category_slug": "apparel",
                },
                {
                    "title": "Leather Biker Jacket",
                    "description": "Classic premium black leather jacket with durable zipper accents.",
                    "price": 199.99,
                    "thumbnail_url": "https://example.com/leather-jacket.jpg",
                    "tags": ["leather", "jacket", "apparel", "fashion", "outerwear"],
                    "category_slug": "apparel",
                },
                {
                    "title": "Trail Backpack 30L",
                    "description": "Waterproof outdoor hiking and trail backpack with hydration compartment.",
                    "price": 79.99,
                    "thumbnail_url": "https://example.com/backpack.jpg",
                    "tags": ["backpack", "gear", "trail", "hiking", "outdoor"],
                    "category_slug": "gear",
                },
                {
                    "title": "Wireless Sports Earbuds",
                    "description": "Sweatproof noise canceling Bluetooth earbuds for workout.",
                    "price": 89.99,
                    "thumbnail_url": "https://example.com/earbuds.jpg",
                    "tags": ["earbuds", "electronics", "wireless", "audio", "running"],
                    "category_slug": "electronics",
                },
            ]

            for prod_info in products_data:
                cat = category_map.get(prod_info["category_slug"])
                cat_id = cat.id if cat else None
                product = Product(
                    id=str(uuid.uuid4()),
                    title=prod_info["title"],
                    description=prod_info["description"],
                    price=prod_info["price"],
                    thumbnail_url=prod_info["thumbnail_url"],
                    tags=",".join(prod_info["tags"]),
                    category_id=cat_id,
                )
                db.add(product)

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()
