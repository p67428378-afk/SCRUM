from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.database import engine, Base
from server.app.routers import auth, bookings, availability, notifications
from server.app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)


def seed_demo_data():
    from server.app.database import SessionLocal
    from server.app.models import Guide, Booking, Availability, Notification
    from server.app.auth import get_password_hash
    from datetime import date

    db = SessionLocal()
    try:
        # Check if demo guide already exists
        demo_guide = db.query(Guide).filter(Guide.email == "test@example.com").first()
        if not demo_guide:
            # Create demo guide
            demo_guide = Guide(
                name="Demo Guide",
                email="test@example.com",
                password_hash=get_password_hash("testpassword"),
            )
            db.add(demo_guide)
            db.commit()
            db.refresh(demo_guide)

            # Seed Bookings
            booking1 = Booking(
                guide_id=demo_guide.guide_id,
                client_name="Alice Smith",
                client_contact="alice@example.com",
                trek_name="Everest Base Camp",
                trek_date=date(2026, 12, 12),
                participants=3,
                payment_status="Paid",
                status="Confirmed",
            )
            booking2 = Booking(
                guide_id=demo_guide.guide_id,
                client_name="Mark Evans",
                client_contact="mark@example.com",
                trek_name="Annapurna Circuit",
                trek_date=date(2026, 12, 15),
                participants=2,
                payment_status="Pending",
                status="Pending",
            )
            booking3 = Booking(
                guide_id=demo_guide.guide_id,
                client_name="Sarah Chen",
                client_contact="sarah@example.com",
                trek_name="Langtang Valley",
                trek_date=date(2026, 12, 18),
                participants=4,
                payment_status="Paid",
                status="Confirmed",
            )
            booking4 = Booking(
                guide_id=demo_guide.guide_id,
                client_name="David Kim",
                client_contact="david@example.com",
                trek_name="Manaslu Circuit",
                trek_date=date(2026, 12, 20),
                participants=1,
                payment_status="Pending",
                status="Pending",
            )
            db.add_all([booking1, booking2, booking3, booking4])

            # Seed Availability
            avail1 = Availability(
                guide_id=demo_guide.guide_id,
                date=date(2026, 12, 12),
                is_available=True,
                notes="Available for short treks",
            )
            avail2 = Availability(
                guide_id=demo_guide.guide_id,
                date=date(2026, 12, 13),
                is_available=False,
                notes="Rest day",
            )
            avail3 = Availability(
                guide_id=demo_guide.guide_id,
                date=date(2026, 12, 14),
                is_available=True,
                notes="Available",
            )
            avail4 = Availability(
                guide_id=demo_guide.guide_id,
                date=date(2026, 12, 15),
                is_available=True,
                notes="Available",
            )
            db.add_all([avail1, avail2, avail3, avail4])

            # Seed Notifications
            notif1 = Notification(
                guide_id=demo_guide.guide_id,
                message="New booking request from John Doe",
                is_read=False,
            )
            notif2 = Notification(
                guide_id=demo_guide.guide_id,
                message="Payment confirmed for Everest Base Camp trek",
                is_read=True,
            )
            notif3 = Notification(
                guide_id=demo_guide.guide_id,
                message="Availability updated for Dec 24-26",
                is_read=False,
            )
            db.add_all([notif1, notif2, notif3])

            db.commit()
    finally:
        db.close()


# Seed demo data on startup if not testing
if not settings.TESTING:
    seed_demo_data()

app = FastAPI(
    title="TrekGuide API",
    description="API for Trekking Guide Bookings & Availability management",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(bookings.router)
app.include_router(availability.router)
app.include_router(notifications.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to TrekGuide API"}
