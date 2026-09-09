import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/city_management.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

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
    from server.app.models import Base  # ensure all models registered

    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.app.models.zone import Zone
    from server.app.models.utility_metric import UtilityMetric
    from server.app.models.citizen import Citizen
    from server.app.models.service_request import ServiceRequest

    # Check if already seeded
    existing_zone = db.query(Zone).first()
    if existing_zone:
        return

    now = datetime.now(timezone.utc)

    # 1. Seed Zones
    zone1 = Zone(
        id=str(uuid.UUID("a1b2c3d4-0000-4000-8000-111111111111")),
        zone_code="ZONE-01",
        name="Downtown Central",
        description="Central commercial and administrative district",
        status="ACTIVE",
        created_at=now,
        updated_at=now,
    )

    zone4 = Zone(
        id=str(uuid.UUID("a1b2c3d4-0000-4000-8000-444444444444")),
        zone_code="ZONE-04",
        name="North Industrial Park",
        description="Industrial and manufacturing hub",
        status="ACTIVE",
        created_at=now,
        updated_at=now,
    )

    db.add_all([zone1, zone4])
    db.flush()

    # 2. Seed Utility Metrics
    metric1 = UtilityMetric(
        id=str(uuid.uuid4()),
        zone_id=zone1.id,
        metric_type="WATER_CONSUMPTION",
        value=18450.0,
        unit="GALLONS_PER_HOUR",
        recorded_at=now,
    )

    metric2 = UtilityMetric(
        id=str(uuid.uuid4()),
        zone_id=zone4.id,
        metric_type="WATER_CONSUMPTION",
        value=14200.5,
        unit="GALLONS_PER_HOUR",
        recorded_at=now,
    )

    metric3 = UtilityMetric(
        id=str(uuid.uuid4()),
        zone_id=zone4.id,
        metric_type="POWER_GRID_STABILITY",
        value=98.4,
        unit="PERCENT",
        recorded_at=now,
    )

    metric4 = UtilityMetric(
        id=str(uuid.uuid4()),
        zone_id=zone4.id,
        metric_type="WASTE_ACCUMULATION",
        value=68.0,
        unit="PERCENT",
        recorded_at=now,
    )

    db.add_all([metric1, metric2, metric3, metric4])
    db.flush()

    # 3. Seed Citizens
    citizen_jane = Citizen(
        id=str(uuid.UUID("c1c2c3c4-0000-4000-8000-333333333333")),
        full_name="Jane Doe",
        email="jane.doe@city.gov",
        phone="555-0192",
        address="123 Elm St",
        created_at=now,
        updated_at=now,
    )

    citizen_test = Citizen(
        id=str(uuid.uuid4()),
        full_name="Test User",
        email="test@example.com",
        phone="555-0100",
        address="456 Main St",
        created_at=now,
        updated_at=now,
    )

    citizen_admin = Citizen(
        id=str(uuid.uuid4()),
        full_name="Admin Director",
        email="admin@example.com",
        phone="555-0101",
        address="City Hall Room 101",
        created_at=now,
        updated_at=now,
    )

    db.add_all([citizen_jane, citizen_test, citizen_admin])
    db.flush()

    # 4. Seed Service Requests
    request1 = ServiceRequest(
        id=str(uuid.UUID("f1f2f3f4-0000-4000-8000-444444444444")),
        ticket_number="SR-2026-88392",
        citizen_id=citizen_jane.id,
        zone_id=zone4.id,
        title="Main Street Water Leak",
        description="Pipe burst near 4th Avenue intersection causing road flooding.",
        category="WATER_INFRASTRUCTURE",
        status="SUBMITTED",
        priority="HIGH",
        assigned_department="PUBLIC_WORKS",
        notes="Awaiting initial crew dispatch.",
        created_at=now,
        updated_at=now,
    )

    db.add(request1)
    db.commit()
