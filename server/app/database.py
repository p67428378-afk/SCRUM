import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./temple.db")

# For SQLite, check_same_thread=False allows multi-threaded requests in FastAPI
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
    """Idempotent database schema initialization."""
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    """Idempotent database seeding for test accounts and default poojas/slots."""
    from datetime import date, timedelta, time
    from server.app.models import User, Pooja, PoojaSlot, Announcement
    from server.app.utils.security import get_password_hash

    # Seed test users
    users_to_seed = [
        {
            "email": "test@example.com",
            "phone": "9876543210",
            "password": "testpassword",
            "full_name": "Test Devotee",
            "role": "Devotee",
            "preferred_language": "Hindi",
            "is_active": True,
        },
        {
            "email": "admin@example.com",
            "phone": "9999999999",
            "password": "adminpassword",
            "full_name": "Temple Admin",
            "role": "Admin",
            "preferred_language": "English",
            "is_active": True,
        },
        {
            "email": "staff@example.com",
            "phone": "8888888888",
            "password": "staffpassword",
            "full_name": "Temple Staff",
            "role": "Staff",
            "preferred_language": "Hindi",
            "is_active": True,
        },
    ]

    for u_data in users_to_seed:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            user = User(
                email=u_data["email"],
                phone=u_data["phone"],
                hashed_password=get_password_hash(u_data["password"]),
                full_name=u_data["full_name"],
                role=u_data["role"],
                preferred_language=u_data["preferred_language"],
                is_active=u_data["is_active"],
            )
            db.add(user)
    db.commit()

    # Seed default Poojas
    poojas_to_seed = [
        {
            "title": "Rudrabhishekam",
            "description": "Sacred bathing ritual of Lord Shiva with panchamrit and holy water for peace and prosperity.",
            "price": 501.00,
            "duration_minutes": 45,
            "is_active": True,
        },
        {
            "title": "Mahadev Aarti",
            "description": "Grand evening worship service with lamps, chanting, and sacred stotrams.",
            "price": 101.00,
            "duration_minutes": 30,
            "is_active": True,
        },
        {
            "title": "Bilvarchana",
            "description": "Offering 108 fresh sacred Bael (Bilva) leaves with chanting of Shiva Ashtottara Shatanamavali.",
            "price": 251.00,
            "duration_minutes": 30,
            "is_active": True,
        },
        {
            "title": "Maha Mritunjaya Jaap",
            "description": "Chanting of the life-giving Mritunjaya mantra for health, well-being, and protection.",
            "price": 1100.00,
            "duration_minutes": 60,
            "is_active": True,
        },
    ]

    pooja_objs = []
    for p_data in poojas_to_seed:
        existing_p = db.query(Pooja).filter(Pooja.title == p_data["title"]).first()
        if not existing_p:
            p = Pooja(**p_data)
            db.add(p)
            db.flush()
            pooja_objs.append(p)
        else:
            pooja_objs.append(existing_p)
    db.commit()

    # Seed Slots for next 7 days for each pooja
    today = date.today()
    times = [
        (time(8, 0), time(9, 0)),
        (time(10, 0), time(11, 0)),
        (time(17, 0), time(18, 0)),
        (time(18, 30), time(19, 30)),
    ]

    for p in pooja_objs:
        for day_offset in range(0, 7):
            s_date = today + timedelta(days=day_offset)
            for start_t, end_t in times:
                existing_slot = (
                    db.query(PoojaSlot)
                    .filter(
                        PoojaSlot.pooja_id == p.id,
                        PoojaSlot.slot_date == s_date,
                        PoojaSlot.start_time == start_t,
                    )
                    .first()
                )
                if not existing_slot:
                    slot = PoojaSlot(
                        pooja_id=p.id,
                        slot_date=s_date,
                        start_time=start_t,
                        end_time=end_t,
                        max_capacity=10,
                        booked_count=0,
                    )
                    db.add(slot)
    db.commit()

    # Seed initial announcement if none exists
    existing_announcement = db.query(Announcement).first()
    if not existing_announcement:
        admin_user = db.query(User).filter(User.role == "Admin").first()
        announcement = Announcement(
            title="Maha Shivratri Special Rituals",
            message="Special Bilvarchana and 24-hour Akhanda Deepam on upcoming Maha Shivratri. Advance booking opens today!",
            created_by=admin_user.id if admin_user else None,
        )
        db.add(announcement)
        db.commit()
