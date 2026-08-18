import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from server.models.models import Base, User, Category, Product, ProductVariant

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/scrum91_app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    init_db()

    # Seed Users
    test_email = "test@example.com"
    existing_user = db.query(User).filter(User.email == test_email).first()
    if not existing_user:
        hashed_pwd = pwd_context.hash("testpassword")
        test_user = User(
            id=str(uuid.uuid4()),
            email=test_email,
            hashed_password=hashed_pwd,
            full_name="Alex Smith",
            is_active=True,
            role="user"
        )
        db.add(test_user)

    admin_email = "admin@example.com"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        hashed_pwd = pwd_context.hash("adminpassword")
        admin_user = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            hashed_password=hashed_pwd,
            full_name="Admin User",
            is_active=True,
            role="admin"
        )
        db.add(admin_user)

    db.commit()

    # Seed Categories
    clothing_cat = db.query(Category).filter(Category.slug == "clothing").first()
    if not clothing_cat:
        clothing_cat = Category(
            id=str(uuid.uuid4()),
            name="Clothing",
            slug="clothing",
            description="Apparel, jackets, t-shirts, and pants"
        )
        db.add(clothing_cat)
        db.commit()
        db.refresh(clothing_cat)

    acc_cat = db.query(Category).filter(Category.slug == "accessories").first()
    if not acc_cat:
        acc_cat = Category(
            id=str(uuid.uuid4()),
            name="Accessories",
            slug="accessories",
            description="Sunglasses, bags, hats, and jewelry"
        )
        db.add(acc_cat)
        db.commit()
        db.refresh(acc_cat)

    # Seed Products if empty
    if db.query(Product).count() == 0:
        p1 = Product(
            id=str(uuid.uuid4()),
            category_id=clothing_cat.id,
            title="Classic Denim Trucker Jacket",
            description="Timeless denim trucker jacket with button closure and chest pockets.",
            price=89.99,
            image_url="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
            is_active=True
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)

        p1_v1 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p1.id,
            size="M",
            color="Blue",
            stock_quantity=15,
            sku="DENIM-JKT-BLU-M"
        )
        p1_v2 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p1.id,
            size="L",
            color="Blue",
            stock_quantity=10,
            sku="DENIM-JKT-BLU-L"
        )
        p1_v3 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p1.id,
            size="M",
            color="Black",
            stock_quantity=8,
            sku="DENIM-JKT-BLK-M"
        )
        db.add_all([p1_v1, p1_v2, p1_v3])

        p2 = Product(
            id=str(uuid.uuid4()),
            category_id=clothing_cat.id,
            title="Graphic Cotton T-Shirt",
            description="100% premium cotton crewneck t-shirt with modern minimal print.",
            price=25.00,
            image_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
            is_active=True
        )
        db.add(p2)
        db.commit()
        db.refresh(p2)

        p2_v1 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p2.id,
            size="S",
            color="White",
            stock_quantity=20,
            sku="TSHIRT-WHT-S"
        )
        p2_v2 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p2.id,
            size="M",
            color="White",
            stock_quantity=25,
            sku="TSHIRT-WHT-M"
        )
        p2_v3 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p2.id,
            size="L",
            color="Black",
            stock_quantity=18,
            sku="TSHIRT-BLK-L"
        )
        db.add_all([p2_v1, p2_v2, p2_v3])

        p3 = Product(
            id=str(uuid.uuid4()),
            category_id=acc_cat.id,
            title="Polarized Aviator Sunglasses",
            description="UV400 protection polarized aviator sunglasses with gold metal frame.",
            price=45.00,
            image_url="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
            is_active=True
        )
        db.add(p3)
        db.commit()
        db.refresh(p3)

        p3_v1 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p3.id,
            size="One Size",
            color="Gold",
            stock_quantity=30,
            sku="SUNGLS-GLD-OS"
        )
        p3_v2 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p3.id,
            size="One Size",
            color="Black",
            stock_quantity=25,
            sku="SUNGLS-BLK-OS"
        )
        db.add_all([p3_v1, p3_v2])

        p4 = Product(
            id=str(uuid.uuid4()),
            category_id=acc_cat.id,
            title="Leather Crossbody Shoulder Bag",
            description="Genuine leather crossbody bag with adjustable strap and brass hardware.",
            price=79.50,
            image_url="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
            is_active=True
        )
        db.add(p4)
        db.commit()
        db.refresh(p4)

        p4_v1 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p4.id,
            size="One Size",
            color="Brown",
            stock_quantity=12,
            sku="LEATHER-BAG-BRN"
        )
        p4_v2 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=p4.id,
            size="One Size",
            color="Black",
            stock_quantity=10,
            sku="LEATHER-BAG-BLK"
        )
        db.add_all([p4_v1, p4_v2])

        db.commit()
