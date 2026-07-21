from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from server.database import engine, Base, SessionLocal
from server.models.user import User
from server.models.room import Room
from server.models.restaurant import Restaurant, MenuItem
from server.routers import auth, rooms, bookings, users, restaurants, orders
from server.routers.auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Core Hotel Management System API",
    description="Backend API for managing rooms, bookings, and users.",
    version="1.0.0",
)

# CORS Middleware configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(restaurants.router)
app.include_router(orders.router)


@app.on_event("startup")
def seed_test_account():
    db = SessionLocal()
    try:
        # Ensure tables are created
        Base.metadata.create_all(bind=engine)

        # Seed default test account if it doesn't exist
        test_email = "test@example.com"
        test_user = db.query(User).filter(User.username == test_email).first()
        if not test_user:
            hashed_pw = get_password_hash("testpassword")
            db_user = User(
                username=test_email, hashed_password=hashed_pw, role="Administrator"
            )
            db.add(db_user)
            db.commit()

        # Seed admin@example.com
        admin_email = "admin@example.com"
        admin_user = db.query(User).filter(User.username == admin_email).first()
        if not admin_user:
            hashed_pw = get_password_hash("adminpassword")
            db_admin = User(
                username=admin_email, hashed_password=hashed_pw, role="Administrator"
            )
            db.add(db_admin)
            db.commit()

        # Seed receptionist@example.com
        receptionist_email = "receptionist@example.com"
        receptionist_user = (
            db.query(User).filter(User.username == receptionist_email).first()
        )
        if not receptionist_user:
            hashed_pw = get_password_hash("testpassword")
            db_receptionist = User(
                username=receptionist_email,
                hashed_password=hashed_pw,
                role="Receptionist",
            )
            db.add(db_receptionist)
            db.commit()

        # Seed manager@example.com
        manager_email = "manager@example.com"
        manager_user = db.query(User).filter(User.username == manager_email).first()
        if not manager_user:
            hashed_pw = get_password_hash("testpassword")
            db_manager = User(
                username=manager_email, hashed_password=hashed_pw, role="Manager"
            )
            db.add(db_manager)
            db.commit()

        # Seed some initial rooms for testing/demo if empty
        if db.query(Room).count() == 0:
            rooms_to_seed = [
                Room(
                    room_number="101",
                    type="Standard",
                    capacity=2,
                    price_per_night=100.00,
                    status="Available",
                ),
                Room(
                    room_number="102",
                    type="Standard",
                    capacity=2,
                    price_per_night=100.00,
                    status="Available",
                ),
                Room(
                    room_number="201",
                    type="Deluxe",
                    capacity=3,
                    price_per_night=180.00,
                    status="Available",
                ),
                Room(
                    room_number="301",
                    type="Suite",
                    capacity=4,
                    price_per_night=350.00,
                    status="Available",
                ),
            ]
            db.add_all(rooms_to_seed)
            db.commit()

        # Seed some initial restaurants and menu items if empty
        if db.query(Restaurant).count() == 0:
            luigi = Restaurant(
                name="Luigi's Pizzeria",
                cuisine="Italian",
                address="123 Main St, Central District",
                phone_number="(555) 123-4567",
                operating_hours="11:00 AM - 10:00 PM",
            )
            db.add(luigi)
            db.commit()
            db.refresh(luigi)

            luigi_items = [
                MenuItem(
                    restaurant_id=luigi.id,
                    name="Margherita Pizza",
                    description="Classic tomato sauce, fresh mozzarella, and basil",
                    price=12.99,
                    category="Pizza",
                ),
                MenuItem(
                    restaurant_id=luigi.id,
                    name="Pepperoni Pizza",
                    description="Tomato sauce, mozzarella, and spicy pepperoni",
                    price=14.99,
                    category="Pizza",
                ),
            ]
            db.add_all(luigi_items)
            db.commit()

            dragon = Restaurant(
                name="Golden Dragon",
                cuisine="Asian",
                address="456 Oak Ave, East Plaza",
                phone_number="(555) 987-6543",
                operating_hours="12:00 PM - 9:30 PM",
            )
            db.add(dragon)
            db.commit()
            db.refresh(dragon)

            dragon_items = [
                MenuItem(
                    restaurant_id=dragon.id,
                    name="Sushi Combo",
                    description="Assorted fresh sushi and sashimi",
                    price=18.99,
                    category="Sushi",
                ),
                MenuItem(
                    restaurant_id=dragon.id,
                    name="Kung Pao Chicken",
                    description="Spicy stir-fried chicken with peanuts and vegetables",
                    price=15.99,
                    category="Main",
                ),
            ]
            db.add_all(dragon_items)
            db.commit()

    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to Core Hotel Management System API"}
