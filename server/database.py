import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/cafe.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        seed_data(db)
        yield db
    finally:
        db.close()


def init_db():
    import server.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    import server.models  # noqa: F401
    from server.models import MenuItem, Table, Order, OrderItem

    # Ensure tables exist on whatever engine this session is bound to
    try:
        bind_engine = db.get_bind()
        Base.metadata.create_all(bind=bind_engine)
    except Exception:
        pass

    # Seed Menu Items if empty
    if db.query(MenuItem).count() == 0:
        menu_items = [
            MenuItem(
                id=str(uuid.uuid4()),
                name="Iced Latte",
                category="Beverages",
                price=4.50,
                description="Espresso with milk over ice",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Espresso",
                category="Beverages",
                price=3.00,
                description="Rich single shot espresso",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Cappuccino",
                category="Beverages",
                price=4.00,
                description="Espresso topped with steamed milk foam",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Avocado Toast",
                category="Food",
                price=8.50,
                description="Sourdough toast with fresh avocado and poached egg",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Club Sandwich",
                category="Food",
                price=10.00,
                description="Triple decker turkey, bacon, lettuce, tomato",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Cheesecake",
                category="Desserts",
                price=6.00,
                description="New York style cheesecake slice",
                is_available=True,
            ),
            MenuItem(
                id=str(uuid.uuid4()),
                name="Chocolate Mousse",
                category="Desserts",
                price=5.50,
                description="Velvety dark chocolate mousse",
                is_available=False,
            ),
        ]
        for item in menu_items:
            db.add(item)
        try:
            db.commit()
        except Exception:
            db.rollback()

    # Seed Tables if empty
    if db.query(Table).count() == 0:
        tables = [
            Table(id=str(uuid.uuid4()), table_number=1, capacity=2, status="Available"),
            Table(id=str(uuid.uuid4()), table_number=2, capacity=2, status="Available"),
            Table(id=str(uuid.uuid4()), table_number=3, capacity=4, status="Available"),
            Table(id=str(uuid.uuid4()), table_number=4, capacity=4, status="Reserved"),
            Table(id=str(uuid.uuid4()), table_number=5, capacity=4, status="Occupied"),
            Table(id=str(uuid.uuid4()), table_number=6, capacity=6, status="Available"),
            Table(id=str(uuid.uuid4()), table_number=7, capacity=6, status="Available"),
            Table(id=str(uuid.uuid4()), table_number=8, capacity=8, status="Available"),
        ]
        for table in tables:
            db.add(table)
        try:
            db.commit()
        except Exception:
            db.rollback()

    # Seed initial order if empty
    if db.query(Order).count() == 0:
        first_item = db.query(MenuItem).filter(MenuItem.is_available.is_(True)).first()
        first_table = db.query(Table).first()
        if first_item:
            order_id = str(uuid.uuid4())
            subtotal = first_item.price * 2
            tax = round(subtotal * 0.08, 2)
            total = round(subtotal + tax, 2)
            sample_order = Order(
                id=order_id,
                order_number="ORD-101",
                table_id=first_table.id if first_table else None,
                subtotal=subtotal,
                tax=tax,
                total_price=total,
                status="Preparing",
            )
            db.add(sample_order)
            db.flush()

            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order_id,
                menu_item_id=first_item.id,
                quantity=2,
                unit_price=first_item.price,
                subtotal=subtotal,
            )
            db.add(order_item)
            try:
                db.commit()
            except Exception:
                db.rollback()
