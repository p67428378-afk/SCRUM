import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tea_management.db")

# For SQLite, ensure check_same_thread is False
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
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import Tea, Recipe
    from sqlalchemy.exc import IntegrityError

    # Check if teas already exist
    existing_teas = db.query(Tea).count()
    if existing_teas == 0:
        sample_teas = [
            Tea(
                name="Dragonwell Green Tea",
                category="Green Tea",
                current_stock_grams=350.0,
                min_threshold_grams=500.0,
                unit_price=18.50,
                supplier_name="Hangzhou Organic Teas",
            ),
            Tea(
                name="Jasmine Pearls",
                category="Green Tea",
                current_stock_grams=1200.0,
                min_threshold_grams=500.0,
                unit_price=22.00,
                supplier_name="Fujian Herbal Co.",
            ),
            Tea(
                name="Traditional Earl Grey",
                category="Black Tea",
                current_stock_grams=2400.0,
                min_threshold_grams=600.0,
                unit_price=14.00,
                supplier_name="Ceylon Export Ltd.",
            ),
            Tea(
                name="Ti Kuan Yin Oolong",
                category="Oolong",
                current_stock_grams=420.0,
                min_threshold_grams=500.0,
                unit_price=26.00,
                supplier_name="Anxi Oolong House",
            ),
            Tea(
                name="Chamomile Blossom",
                category="Herbal",
                current_stock_grams=3100.0,
                min_threshold_grams=400.0,
                unit_price=12.50,
                supplier_name="Alpine Herbs USA",
            ),
        ]
        for tea in sample_teas:
            db.add(tea)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()

    # Check if recipes exist
    existing_recipes = db.query(Recipe).count()
    if existing_recipes == 0:
        teas = db.query(Tea).all()
        tea_map = {t.name: t.id for t in teas}

        recipes = []
        if "Dragonwell Green Tea" in tea_map:
            recipes.append(
                Recipe(
                    tea_id=tea_map["Dragonwell Green Tea"],
                    steep_temperature_c=85.0,
                    steep_time_seconds=90,
                    leaf_water_ratio_g_per_ml="4g / 200ml",
                    instructions="Glass tumbler. Stream water down side. 90s steep.",
                )
            )
        if "Jasmine Pearls" in tea_map:
            recipes.append(
                Recipe(
                    tea_id=tea_map["Jasmine Pearls"],
                    steep_temperature_c=80.0,
                    steep_time_seconds=120,
                    leaf_water_ratio_g_per_ml="5g / 250ml",
                    instructions="Pre-heat gaiwan. Rinse 5s. Steep at 80°C for 120s.",
                )
            )
        if "Ti Kuan Yin Oolong" in tea_map:
            recipes.append(
                Recipe(
                    tea_id=tea_map["Ti Kuan Yin Oolong"],
                    steep_temperature_c=95.0,
                    steep_time_seconds=45,
                    leaf_water_ratio_g_per_ml="7g / 150ml",
                    instructions="Yixing clay pot. Flash steep 45s at 95°C.",
                )
            )

        for recipe in recipes:
            db.add(recipe)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
