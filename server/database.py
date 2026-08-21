import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./recipes.db")

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
    # Import models here to ensure they are registered on Base.metadata
    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import Recipe, Ingredient

    # Check if any recipes exist
    if db.query(Recipe).count() == 0:
        # Seed Spaghetti Carbonara
        carbonara = Recipe(
            title="Spaghetti Carbonara",
            description="Classic Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper.",
            prep_time=10,
            cook_time=15,
            servings=4,
            instructions="1. Cook pasta in salted water.\n2. Crisp the guanciale in a pan.\n3. Whisk eggs and grated cheese.\n4. Combine all ingredients off the heat with pasta water.",
        )
        db.add(carbonara)
        db.flush()  # Get carbonara.id

        ingredients = [
            Ingredient(
                recipe_id=carbonara.id, name="Spaghetti", quantity="400", unit="g"
            ),
            Ingredient(
                recipe_id=carbonara.id, name="Guanciale", quantity="150", unit="g"
            ),
            Ingredient(recipe_id=carbonara.id, name="Eggs", quantity="4", unit="large"),
            Ingredient(
                recipe_id=carbonara.id, name="Pecorino Romano", quantity="75", unit="g"
            ),
            Ingredient(
                recipe_id=carbonara.id,
                name="Black Pepper",
                quantity="to taste",
                unit="",
            ),
        ]
        for ing in ingredients:
            db.add(ing)

        db.commit()
