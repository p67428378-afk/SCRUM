from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.config import DATABASE_URL
from server.models import Base, User, Ingredient, Product, Recipe

# Configure connect args for SQLite if needed
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

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
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

    # 1. Seed Admin User
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            hashed_password=pwd_context.hash("adminpassword"),
            full_name="System Administrator",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)

    # 2. Seed Regular Test User
    test_u = db.query(User).filter(User.email == "test@example.com").first()
    if not test_u:
        test_user = User(
            email="test@example.com",
            hashed_password=pwd_context.hash("testpassword"),
            full_name="Test Staff",
            role="staff",
            is_active=True,
            is_verified=True,
        )
        db.add(test_user)

    db.commit()

    # 3. Seed Default Ingredients if empty
    if db.query(Ingredient).count() == 0:
        ingredients = [
            Ingredient(
                name="Flour", unit="kg", stock_quantity=100.0, reorder_threshold=20.0
            ),
            Ingredient(
                name="Sugar", unit="kg", stock_quantity=50.0, reorder_threshold=10.0
            ),
            Ingredient(
                name="Butter", unit="kg", stock_quantity=30.0, reorder_threshold=5.0
            ),
            Ingredient(
                name="Eggs", unit="pcs", stock_quantity=200.0, reorder_threshold=30.0
            ),
            Ingredient(
                name="Yeast", unit="g", stock_quantity=1000.0, reorder_threshold=200.0
            ),
            Ingredient(
                name="Chocolate", unit="kg", stock_quantity=15.0, reorder_threshold=3.0
            ),
        ]
        db.add_all(ingredients)
        db.commit()

        # Fetch saved ingredients
        flour = db.query(Ingredient).filter_by(name="Flour").first()
        butter = db.query(Ingredient).filter_by(name="Butter").first()
        sugar = db.query(Ingredient).filter_by(name="Sugar").first()
        chocolate = db.query(Ingredient).filter_by(name="Chocolate").first()

        # 4. Seed Default Products
        croissant = Product(
            name="Butter Croissant",
            category="Pastry",
            price=3.50,
            description="Flaky, golden butter croissant baked fresh daily.",
        )
        choc_cake = Product(
            name="Chocolate Cake Slice",
            category="Cake",
            price=5.00,
            description="Rich dark chocolate layer cake slice.",
        )
        db.add_all([croissant, choc_cake])
        db.commit()

        # 5. Seed Recipes
        recipes = [
            Recipe(
                product_id=croissant.id, ingredient_id=flour.id, quantity_required=0.15
            ),
            Recipe(
                product_id=croissant.id, ingredient_id=butter.id, quantity_required=0.08
            ),
            Recipe(
                product_id=croissant.id, ingredient_id=sugar.id, quantity_required=0.02
            ),
            Recipe(
                product_id=choc_cake.id, ingredient_id=flour.id, quantity_required=0.10
            ),
            Recipe(
                product_id=choc_cake.id, ingredient_id=sugar.id, quantity_required=0.05
            ),
            Recipe(
                product_id=choc_cake.id,
                ingredient_id=chocolate.id,
                quantity_required=0.05,
            ),
        ]
        db.add_all(recipes)
        db.commit()
