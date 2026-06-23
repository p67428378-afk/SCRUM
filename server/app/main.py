from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.api.endpoints import router as api_router
from app.models import Category, Material, Gemstone
from app.crud import create_inventory_item
from app.schemas import InventoryItemCreate


def seed_database(db):
    # Check if already seeded
    if db.query(Category).first() is not None:
        return

    # Seed categories
    categories = ["Ring", "Necklace", "Earring", "Bracelet"]
    for cat_name in categories:
        db.add(Category(name=cat_name))

    # Seed materials
    materials = ["Gold", "Silver", "Platinum"]
    for mat_name in materials:
        db.add(Material(name=mat_name))

    # Seed gemstones
    gemstones = ["Diamond", "Ruby", "Emerald", "Sapphire", "None"]
    for gem_name in gemstones:
        db.add(Gemstone(name=gem_name))

    db.commit()

    # Seed some initial products
    initial_items = [
        InventoryItemCreate(
            name="Diamond Solitaire Ring",
            category="Ring",
            material="Gold",
            gemstone_type="Diamond",
            carat_weight=1.5,
            price=5000.0,
            stock_quantity=10,
            low_stock_threshold=3,
        ),
        InventoryItemCreate(
            name="Gold Hoop Earrings",
            category="Earring",
            material="Gold",
            gemstone_type="None",
            carat_weight=None,
            price=800.0,
            stock_quantity=1,
            low_stock_threshold=3,
        ),
        InventoryItemCreate(
            name="Sapphire Pendant",
            category="Necklace",
            material="Platinum",
            gemstone_type="Sapphire",
            carat_weight=2.0,
            price=12000.0,
            stock_quantity=0,
            low_stock_threshold=2,
        ),
    ]

    for item in initial_items:
        create_inventory_item(db, item, user_id="system")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="AuraJewel Inventory Management API",
    description="API for managing jewellery inventory, stock levels, and audit logs.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to AuraJewel Inventory Management API"}
