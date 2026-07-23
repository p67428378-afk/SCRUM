import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# SQLite-specific connect arguments
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


def seed_data(db):
    from server.models import Product, Scenario

    # Seed Products
    initial_products = [
        {
            "sku_id": "SNC-001",
            "product_name": "Spicy Nacho Chips",
            "weekly_sales": 4250.00,
            "profit_margin": 0.4200,
            "status": "GROW",
        },
        {
            "sku_id": "CPC-002",
            "product_name": "Classic Potato Crisps",
            "weekly_sales": 3800.00,
            "profit_margin": 0.3500,
            "status": "MAINTAIN",
        },
        {
            "sku_id": "CCP-003",
            "product_name": "Cheddar Cheese Puffs",
            "weekly_sales": 3100.00,
            "profit_margin": 0.3800,
            "status": "MAINTAIN",
        },
        {
            "sku_id": "SPT-004",
            "product_name": "Salted Pretzel Twists",
            "weekly_sales": 1200.00,
            "profit_margin": 0.2200,
            "status": "SWAP",
        },
        {
            "sku_id": "SCC-005",
            "product_name": "Sweet Caramel Corn",
            "weekly_sales": 850.00,
            "profit_margin": 0.1800,
            "status": "REDUCE",
        },
    ]

    for p_data in initial_products:
        existing = db.query(Product).filter(Product.sku_id == p_data["sku_id"]).first()
        if not existing:
            product = Product(
                id=str(uuid.uuid4()),
                sku_id=p_data["sku_id"],
                product_name=p_data["product_name"],
                weekly_sales=p_data["weekly_sales"],
                profit_margin=p_data["profit_margin"],
                status=p_data["status"],
            )
            db.add(product)

    # Seed Scenarios
    initial_scenarios = [
        {
            "name": "Conservative",
            "projected_sales_lift": 0.0200,
            "private_brand_impact": 0.0100,
            "actions": [
                {"sku_id": "CPC-002", "action": "MAINTAIN"},
                {"sku_id": "XYZ-003", "action": "REDUCE"},
            ],
        },
        {
            "name": "Balanced",
            "projected_sales_lift": 0.0500,
            "private_brand_impact": 0.0250,
            "actions": [
                {"sku_id": "SNC-001", "action": "GROW"},
                {"sku_id": "NEW-001", "action": "ADD"},
            ],
        },
        {
            "name": "Aggressive",
            "projected_sales_lift": 0.1000,
            "private_brand_impact": 0.0500,
            "actions": [
                {"sku_id": "SNC-001", "action": "GROW"},
                {"sku_id": "XYZ-003", "action": "SWAP"},
            ],
        },
    ]

    for s_data in initial_scenarios:
        existing = db.query(Scenario).filter(Scenario.name == s_data["name"]).first()
        if not existing:
            scenario = Scenario(
                id=str(uuid.uuid4()),
                name=s_data["name"],
                projected_sales_lift=s_data["projected_sales_lift"],
                private_brand_impact=s_data["private_brand_impact"],
                actions=s_data["actions"],
            )
            db.add(scenario)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
