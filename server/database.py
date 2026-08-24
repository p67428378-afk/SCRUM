import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./grocery.db")

# For SQLite, we need connect_args={"check_same_thread": False}
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


def init_db():
    # Import models here to register them on Base.metadata
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User, Item, Inventory
    from server.auth import get_password_hash
    from sqlalchemy.exc import IntegrityError

    # Seed Users
    users_to_seed = [
        {"email": "admin@example.com", "password": "adminpassword", "role": "Admin"},
        {"email": "test@example.com", "password": "testpassword", "role": "Manager"},
        {"email": "staff@example.com", "password": "staffpassword", "role": "Staff"},
    ]

    for u_data in users_to_seed:
        existing_user = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_user:
            hashed = get_password_hash(u_data["password"])
            new_user = User(
                email=u_data["email"], hashed_password=hashed, role=u_data["role"]
            )
            db.add(new_user)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # Seed some initial items if empty
    if db.query(Item).count() == 0:
        items_to_seed = [
            {
                "sku": "PROD-APL-001",
                "name": "Fuji Apples",
                "category": "Produce",
                "unit_price": 2.99,
                "cost_price": 1.50,
                "unit_of_measure": "kg",
                "supplier_name": "Fresh Farms Co.",
                "initial_stock": 15.0,
                "reorder_threshold": 20.0,
            },
            {
                "sku": "PROD-MIL-002",
                "name": "Organic Whole Milk",
                "category": "Dairy",
                "unit_price": 4.50,
                "cost_price": 2.50,
                "unit_of_measure": "pack",
                "supplier_name": "Valley Dairy",
                "initial_stock": 45.0,
                "reorder_threshold": 15.0,
            },
        ]

        for item_data in items_to_seed:
            new_item = Item(
                sku=item_data["sku"],
                name=item_data["name"],
                category=item_data["category"],
                unit_price=item_data["unit_price"],
                cost_price=item_data["cost_price"],
                unit_of_measure=item_data["unit_of_measure"],
                supplier_name=item_data["supplier_name"],
            )
            db.add(new_item)
            try:
                db.commit()
                # Initialize inventory
                new_inv = Inventory(
                    item_id=new_item.id,
                    current_stock=item_data["initial_stock"],
                    reorder_threshold=item_data["reorder_threshold"],
                )
                db.add(new_inv)
                db.commit()
            except IntegrityError:
                db.rollback()
