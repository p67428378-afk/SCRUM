import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

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
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    from server import models
    import uuid

    # Seed Category
    cat = db.query(models.Category).filter_by(name="General Electronics").first()
    if not cat:
        cat = models.Category(
            id=str(uuid.uuid4()),
            name="General Electronics",
            description="Electronic components and widgets",
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)

    # Seed Warehouse
    wh = db.query(models.Warehouse).filter_by(code="WH-CENTRAL").first()
    if not wh:
        wh = models.Warehouse(
            id="11111111-2222-3333-4444-555555555555",
            code="WH-CENTRAL",
            name="Warehouse A",
            location="Building 1, Main Campus",
        )
        db.add(wh)
        db.commit()
        db.refresh(wh)

    # Seed Item SKU-9901
    item = db.query(models.Item).filter_by(sku="SKU-9901").first()
    if not item:
        item = models.Item(
            id="e81d7f42-a123-4bde-8f81-8971f1234567",
            category_id=cat.id,
            sku="SKU-9901",
            name="Industrial Widget Alpha",
            unit_price=49.99,
            reorder_threshold=10,
            reorder_quantity=50,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

    # Seed Stock Level
    stock = (
        db.query(models.StockLevel)
        .filter_by(item_id=item.id, warehouse_id=wh.id)
        .first()
    )
    if not stock:
        stock = models.StockLevel(
            id=str(uuid.uuid4()),
            item_id=item.id,
            warehouse_id=wh.id,
            quantity_on_hand=150,
        )
        db.add(stock)
        db.commit()
