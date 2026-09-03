import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.models import Base, MenuItem, Table

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cafe.db")

# For SQLite, check_same_thread=False is required for multi-threading
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


def seed_data(db: Session):
    """Seed initial tables and menu items if they do not exist."""
    # Seed Tables 1-8
    if db.query(Table).count() == 0:
        initial_tables = [
            Table(table_number=1, capacity=2, status="Available"),
            Table(table_number=2, capacity=2, status="Available"),
            Table(table_number=3, capacity=4, status="Available"),
            Table(table_number=4, capacity=4, status="Available"),
            Table(table_number=5, capacity=6, status="Available"),
            Table(table_number=6, capacity=6, status="Available"),
            Table(table_number=7, capacity=8, status="Available"),
            Table(table_number=8, capacity=8, status="Available"),
        ]
        db.add_all(initial_tables)
        db.commit()

    # Seed Default Menu Items
    if db.query(MenuItem).count() == 0:
        initial_menu_items = [
            # Beverages
            MenuItem(
                name="Espresso",
                category="Beverages",
                price=3.00,
                description="Rich and bold single shot espresso",
                is_available=True,
            ),
            MenuItem(
                name="Iced Latte",
                category="Beverages",
                price=4.50,
                description="Espresso with chilled milk over ice",
                is_available=True,
            ),
            MenuItem(
                name="Cappuccino",
                category="Beverages",
                price=4.00,
                description="Espresso topped with foamed milk",
                is_available=True,
            ),
            MenuItem(
                name="Green Tea",
                category="Beverages",
                price=3.50,
                description="Organic steamed green tea leaves",
                is_available=True,
            ),
            # Food
            MenuItem(
                name="Butter Croissant",
                category="Food",
                price=3.50,
                description="Flaky and buttery freshly baked croissant",
                is_available=True,
            ),
            MenuItem(
                name="Club Sandwich",
                category="Food",
                price=8.50,
                description="Triple-decker sandwich with turkey, bacon, and lettuce",
                is_available=True,
            ),
            MenuItem(
                name="Avocado Toast",
                category="Food",
                price=7.00,
                description="Sourdough toast topped with fresh mashed avocado",
                is_available=True,
            ),
            # Desserts
            MenuItem(
                name="NY Cheesecake",
                category="Desserts",
                price=5.50,
                description="Classic creamy New York cheesecake slice",
                is_available=True,
            ),
            MenuItem(
                name="Tiramisu",
                category="Desserts",
                price=6.00,
                description="Coffee-flavoured Italian dessert",
                is_available=True,
            ),
        ]
        db.add_all(initial_menu_items)
        db.commit()
