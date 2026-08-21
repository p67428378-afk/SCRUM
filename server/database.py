import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from server.models import Base, User, Cat

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

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
    from server.auth import get_password_hash

    # Seed test buyer
    buyer_email = "test@example.com"
    test_buyer = db.query(User).filter(User.email == buyer_email).first()
    if not test_buyer:
        test_buyer = User(
            email=buyer_email,
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Buyer",
            role="buyer",
        )
        db.add(test_buyer)

    # Seed admin seller
    seller_email = "admin@example.com"
    admin_seller = db.query(User).filter(User.email == seller_email).first()
    if not admin_seller:
        admin_seller = User(
            email=seller_email,
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Seller",
            role="seller",
        )
        db.add(admin_seller)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        admin_seller = db.query(User).filter(User.email == seller_email).first()

    # Refresh seller ID
    if admin_seller and admin_seller.id:
        seller_id = admin_seller.id

        # Seed initial sample cats if table is empty
        cat_count = db.query(Cat).count()
        if cat_count == 0:
            sample_cats = [
                Cat(
                    seller_id=seller_id,
                    name="Luna",
                    breed="Siamese",
                    age_months=4,
                    gender="Female",
                    price=350.0,
                    description="Luna is a playful and affectionate 4-month-old Siamese kitten. She loves feather toys and human company.",
                    image_url="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
                    status="Available",
                ),
                Cat(
                    seller_id=seller_id,
                    name="Milo",
                    breed="British Shorthair",
                    age_months=3,
                    gender="Male",
                    price=400.0,
                    description="Milo is a chubby British Shorthair kitten who loves naps and treats.",
                    image_url="https://images.unsplash.com/photo-1573865526739-10659fec78a5",
                    status="Available",
                ),
                Cat(
                    seller_id=seller_id,
                    name="Oliver",
                    breed="Persian",
                    age_months=14,
                    gender="Male",
                    price=500.0,
                    description="Oliver is a calm Persian cat with a lush white coat and gentle temperament.",
                    image_url="https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
                    status="Available",
                ),
                Cat(
                    seller_id=seller_id,
                    name="Bella",
                    breed="Maine Coon",
                    age_months=8,
                    gender="Female",
                    price=600.0,
                    description="Bella is a fluffy Maine Coon kitten who is playful and friendly.",
                    image_url="https://images.unsplash.com/photo-1543852786-1cf6624b9987",
                    status="Sold",
                ),
            ]
            db.add_all(sample_cats)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
