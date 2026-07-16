from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from server.database import engine, Base, SessionLocal
from server.models.user import User
from server.models.room import Room
from server.routers import auth, rooms, bookings, users
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
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Welcome to Core Hotel Management System API"}
