import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/farm_app.db")

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
    from server import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server import models
    from server.auth import get_password_hash

    # Seed users
    test_user = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    if not test_user:
        test_user = models.User(
            email="test@example.com",
            full_name="Test Farm Manager",
            hashed_password=get_password_hash("testpassword"),
            role="farm_manager",
            is_active=True,
            is_verified=True,
        )
        db.add(test_user)

    admin_user = (
        db.query(models.User).filter(models.User.email == "admin@example.com").first()
    )
    if not admin_user:
        admin_user = models.User(
            email="admin@example.com",
            full_name="Admin User",
            hashed_password=get_password_hash("adminpassword"),
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)

    db.commit()

    # Seed sample field
    if not db.query(models.Field).first():
        f1 = models.Field(
            name="North Pasture Field A",
            acreage=120.5,
            location_gis="42.3601,-71.0589",
            soil_type="Loam",
        )
        db.add(f1)
        db.commit()
        db.refresh(f1)

        c1 = models.CropCycle(
            field_id=f1.id,
            crop_type="Corn",
            planting_date="2026-04-15",
            target_harvest_date="2026-09-30",
            soil_health_notes="Optimal Nitrogen levels (pH 6.5)",
            status="ACTIVE",
        )
        db.add(c1)

    # Seed sample livestock
    if not db.query(models.Livestock).first():
        ls1 = models.Livestock(
            tag_number="COW-101",
            species="Cattle",
            breed="Angus",
            birth_date="2024-03-12",
            status="HEALTHY",
        )
        db.add(ls1)
        db.commit()
        db.refresh(ls1)

        hr1 = models.HealthRecord(
            livestock_id=ls1.id,
            event_type="VACCINATION",
            event_date="2026-01-10",
            medication_name="Bovine Vaccine Type A",
            next_due_date="2026-07-10",
            notes="Annual health booster administered",
        )
        db.add(hr1)

    # Seed sample equipment
    if not db.query(models.Equipment).first():
        eq1 = models.Equipment(
            name="John Deere 8R Tractor",
            serial_number="JD-8R-99823",
            operating_hours=480.0,
            status="OPERATIONAL",
            last_service_date="2025-11-20",
            maintenance_threshold_hours=500.0,
        )
        db.add(eq1)

    # Seed sample inventory
    if not db.query(models.InventoryItem).first():
        inv1 = models.InventoryItem(
            item_name="NPK Fertilizer 10-10-10",
            category="Fertilizer",
            quantity=50.0,
            unit="bags",
            reorder_threshold=100.0,
        )
        inv2 = models.InventoryItem(
            item_name="Corn Seeds Hybrid",
            category="Seeds",
            quantity=250.0,
            unit="kg",
            reorder_threshold=50.0,
        )
        db.add_all([inv1, inv2])

    # Seed initial low-stock alert if applicable
    if not db.query(models.OperationalAlert).first():
        alt1 = models.OperationalAlert(
            alert_type="LOW_STOCK",
            severity="WARNING",
            message="NPK Fertilizer 10-10-10 is below reorder threshold (50.0 bags remaining)",
            is_resolved=False,
        )
        db.add(alt1)

    try:
        db.commit()
    except Exception:
        db.rollback()
