from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./garbage_management.db")

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
    from server import models  # noqa

    Base.metadata.create_all(bind=engine)


def seed_data(db):
    from server.models import User, WasteBin, PickupRequest, CollectionRoute, RouteTask
    from server.auth import get_password_hash
    import uuid
    from datetime import date

    existing_user = db.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        return

    try:
        resident = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            password_hash=get_password_hash("testpassword"),
            full_name="Test Resident",
            role="Resident",
            is_active=True,
            is_verified=True,
        )
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            password_hash=get_password_hash("adminpassword"),
            full_name="Admin Director",
            role="Admin",
            is_active=True,
            is_verified=True,
        )
        driver = User(
            id=str(uuid.uuid4()),
            email="driver@example.com",
            password_hash=get_password_hash("driverpassword"),
            full_name="Dave Miller",
            role="Driver",
            is_active=True,
            is_verified=True,
        )
        db.add_all([resident, admin, driver])
        db.commit()

        bin1 = WasteBin(
            id=str(uuid.uuid4()),
            serial_number="ECO-4091",
            location_address="4th & Market St",
            zone_code="Zone 1",
            waste_type="General Waste",
            fill_level_pct=94,
            status="Overflowing",
        )
        bin2 = WasteBin(
            id=str(uuid.uuid4()),
            serial_number="ECO-8120",
            location_address="Pier 17 Promenade",
            zone_code="Zone 2",
            waste_type="Recyclables",
            fill_level_pct=45,
            status="Moderate",
        )
        bin3 = WasteBin(
            id=str(uuid.uuid4()),
            serial_number="ECO-1020",
            location_address="142 Harborview Blvd",
            zone_code="Zone 2",
            waste_type="General Waste",
            fill_level_pct=85,
            status="Full",
        )
        bin4 = WasteBin(
            id=str(uuid.uuid4()),
            serial_number="ECO-3050",
            location_address="344 Bayside Ave",
            zone_code="Zone 2",
            waste_type="Organic Waste",
            fill_level_pct=15,
            status="Empty",
        )
        db.add_all([bin1, bin2, bin3, bin4])
        db.commit()

        pickup1 = PickupRequest(
            id=str(uuid.uuid4()),
            user_id=resident.id,
            tracking_code="TRK-8821",
            waste_type="Hazardous Waste",
            address="123 Main St, Zone 2",
            scheduled_date="2026-06-01",
            time_slot="09:00 - 12:00",
            special_notes="2 sealed boxes at front curb near driveway",
            status="Confirmed",
        )
        pickup2 = PickupRequest(
            id=str(uuid.uuid4()),
            user_id=resident.id,
            tracking_code="TRK-8790",
            waste_type="Organic Waste",
            address="123 Main St, Zone 2",
            scheduled_date="2026-05-28",
            time_slot="13:00 - 16:00",
            special_notes="",
            status="Completed",
        )
        db.add_all([pickup1, pickup2])
        db.commit()

        route1 = CollectionRoute(
            id=str(uuid.uuid4()),
            driver_id=driver.id,
            route_name="RT-ZONE2-NORTH",
            zone_code="Zone 2",
            scheduled_date=date.today().isoformat(),
            status="In Progress",
        )
        db.add(route1)
        db.commit()

        task1 = RouteTask(
            id=str(uuid.uuid4()),
            route_id=route1.id,
            bin_id=bin3.id,
            pickup_id=None,
            sequence_number=1,
            task_status="Completed",
            collected_weight_kg=250.0,
            skip_reason=None,
            evidence_url=None,
        )
        task2 = RouteTask(
            id=str(uuid.uuid4()),
            route_id=route1.id,
            bin_id=bin4.id,
            pickup_id=None,
            sequence_number=2,
            task_status="Skipped",
            collected_weight_kg=0.0,
            skip_reason="Blocked Access",
            evidence_url="http://example.com/evidence1.jpg",
        )
        task3 = RouteTask(
            id=str(uuid.uuid4()),
            route_id=route1.id,
            bin_id=None,
            pickup_id=pickup1.id,
            sequence_number=3,
            task_status="Pending",
            collected_weight_kg=0.0,
            skip_reason=None,
            evidence_url=None,
        )
        db.add_all([task1, task2, task3])
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
