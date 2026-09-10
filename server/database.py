import os
import uuid
from datetime import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/salon.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
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
    from server import models

    # Seed Default Services
    default_services = [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Haircut & Styling",
            "duration_minutes": 60,
            "price": 75.0,
            "loyalty_points_earned": 15,
        },
        {
            "id": "22222222-2222-2222-2222-222222222222",
            "name": "Hair Coloring",
            "duration_minutes": 120,
            "price": 150.0,
            "loyalty_points_earned": 30,
        },
        {
            "id": "33333333-3333-3333-3333-333333333333",
            "name": "Manicure & Pedicure",
            "duration_minutes": 45,
            "price": 50.0,
            "loyalty_points_earned": 10,
        },
        {
            "id": "44444444-4444-4444-4444-444444444444",
            "name": "Facial Treatment",
            "duration_minutes": 60,
            "price": 90.0,
            "loyalty_points_earned": 20,
        },
    ]

    services_by_id = {}
    for svc_data in default_services:
        existing = db.query(models.Service).filter_by(id=svc_data["id"]).first()
        if not existing:
            existing = models.Service(**svc_data)
            db.add(existing)
            try:
                db.commit()
                db.refresh(existing)
            except IntegrityError:
                db.rollback()
                existing = db.query(models.Service).filter_by(id=svc_data["id"]).first()
        services_by_id[svc_data["id"]] = existing

    # Seed Default Staff
    default_staff = [
        {
            "id": "aaaaa111-1111-1111-1111-111111111111",
            "full_name": "Sarah Jenkins",
            "email": "sarah@salon.com",
            "phone": "+15550192",
            "is_active": True,
        },
        {
            "id": "bbbbb222-2222-2222-2222-222222222222",
            "full_name": "Elena Rostova",
            "email": "elena@salon.com",
            "phone": "+15550193",
            "is_active": True,
        },
    ]

    staff_by_id = {}
    for st_data in default_staff:
        existing = db.query(models.Staff).filter_by(email=st_data["email"]).first()
        if not existing:
            existing = models.Staff(**st_data)
            db.add(existing)
            try:
                db.commit()
                db.refresh(existing)
            except IntegrityError:
                db.rollback()
                existing = (
                    db.query(models.Staff).filter_by(email=st_data["email"]).first()
                )
        staff_by_id[st_data["id"]] = existing

        # Assign services & schedules to staff
        if existing:
            # Assign all services to staff
            for svc_id, svc in services_by_id.items():
                if svc and svc not in existing.services:
                    existing.services.append(svc)

            # Assign schedules (Mon-Fri, 9am-5pm with break 12:30-1:30pm)
            for day in range(5):  # 0 to 4
                sched_exists = (
                    db.query(models.StaffSchedule)
                    .filter_by(staff_id=existing.id, day_of_week=day)
                    .first()
                )
                if not sched_exists:
                    sched = models.StaffSchedule(
                        id=str(uuid.uuid4()),
                        staff_id=existing.id,
                        day_of_week=day,
                        start_time=time(9, 0),
                        end_time=time(17, 0),
                        break_start=time(12, 30),
                        break_end=time(13, 30),
                    )
                    db.add(sched)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()

    # Seed Default Customers (including test accounts per Constitution)
    default_customers = [
        {
            "id": "c1111111-1111-1111-1111-111111111111",
            "full_name": "Test Customer",
            "email": "test@example.com",
            "phone": "+15550100",
            "loyalty_points": 150,
            "notes": "Prefers organic hair dye formulas. Sensitive skin.",
            "preferred_staff_id": "aaaaa111-1111-1111-1111-111111111111",
            "is_active": True,
            "is_verified": True,
            "role": "customer",
        },
        {
            "id": "c2222222-2222-2222-2222-222222222222",
            "full_name": "Admin Salon Manager",
            "email": "admin@example.com",
            "phone": "+15550101",
            "loyalty_points": 500,
            "notes": "Salon Manager Account",
            "is_active": True,
            "is_verified": True,
            "role": "admin",
        },
        {
            "id": "c3333333-3333-3333-3333-333333333333",
            "full_name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+15550102",
            "loyalty_points": 100,
            "notes": "Prefers appointments in the afternoon.",
            "preferred_staff_id": "bbbbb222-2222-2222-2222-222222222222",
            "is_active": True,
            "is_verified": True,
            "role": "customer",
        },
    ]

    for cust_data in default_customers:
        existing = db.query(models.Customer).filter_by(email=cust_data["email"]).first()
        if not existing:
            existing = models.Customer(**cust_data)
            db.add(existing)
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
