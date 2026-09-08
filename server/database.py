from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from server.config import settings

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
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
    from server import models
    from server.auth import get_password_hash
    from sqlalchemy.exc import IntegrityError

    # 1. Seed Accounts
    users_to_seed = [
        {
            "email": "admin@example.com",
            "password": "adminpassword",
            "full_name": "Village Admin",
            "role": "Admin",
            "phone": "+15550000001",
            "household_address": "Admin Office #1",
        },
        {
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "John Resident",
            "role": "Resident",
            "phone": "+15550000002",
            "household_address": "House #12, Maple Street",
        },
        {
            "email": "staff@example.com",
            "password": "staffpassword",
            "full_name": "Staff Maintenance",
            "role": "Staff",
            "phone": "+15550000003",
            "household_address": "Staff Quarters #B",
        },
    ]

    for u in users_to_seed:
        existing = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not existing:
            user_obj = models.User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                phone=u["phone"],
                household_address=u["household_address"],
                is_active=True,
            )
            db.add(user_obj)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # Get admin user ID for authoring initial data
    admin_user = db.query(models.User).filter(models.User.role == "Admin").first()
    admin_id = admin_user.id if admin_user else None

    # 2. Seed Facilities
    facilities_to_seed = [
        {
            "name": "Community Hall",
            "description": "Spacious community hall suitable for parties, town halls, and gatherings.",
            "capacity": 200,
            "hourly_rate": 50.0,
            "is_active": True,
        },
        {
            "name": "Tennis Court",
            "description": "Outdoor regulation tennis court with night lighting.",
            "capacity": 4,
            "hourly_rate": 20.0,
            "is_active": True,
        },
        {
            "name": "Clubhouse Swimming Pool",
            "description": "Community lap pool and leisure deck.",
            "capacity": 30,
            "hourly_rate": 15.0,
            "is_active": True,
        },
    ]

    for f in facilities_to_seed:
        existing = (
            db.query(models.Facility).filter(models.Facility.name == f["name"]).first()
        )
        if not existing:
            fac = models.Facility(**f)
            db.add(fac)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # 3. Seed Initial Emergency Announcement
    if admin_id:
        existing_ann = db.query(models.Announcement).first()
        if not existing_ann:
            ann = models.Announcement(
                title="🚨 EMERGENCY ALERT: Water Main Maintenance",
                content="Water main shutoff scheduled for tomorrow 9 AM - 2 PM. Please store emergency water.",
                urgency="Emergency",
                author_id=admin_id,
                is_archived=False,
            )
            db.add(ann)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
