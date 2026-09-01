import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from passlib.context import CryptContext
from server.app.config import settings

DATABASE_URL = settings.DATABASE_URL

# Handle sqlite connect_args if needed
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    from server.app.models import User, Property, PropertyPriceHistory

    # Seed regular user
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=pwd_context.hash("testpassword"),
            is_active=True,
            is_verified=True,
            role="user",
        )
        db.add(user)

    # Seed admin user
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            hashed_password=pwd_context.hash("adminpassword"),
            is_active=True,
            is_verified=True,
            role="admin",
        )
        db.add(admin)

    db.commit()

    # Seed sample properties if table is empty
    if db.query(Property).count() == 0:
        now = datetime.utcnow()
        prop1 = Property(
            id=str(uuid.uuid4()),
            title="1234 Maplewood Terrace",
            description="Beautiful modern home in downtown Austin.",
            price=450000.0,
            city="Austin",
            zip_code="78701",
            address="1234 Maplewood Terrace, Austin, TX 78701",
            sqft=1200,
            bedrooms=3,
            bathrooms=2.0,
            status="Active",
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=10),
        )
        db.add(prop1)

        prop2 = Property(
            id=str(uuid.uuid4()),
            title="5678 Oak Ridge Way",
            description="Spacious suburban family residence.",
            price=520000.0,
            city="Austin",
            zip_code="78701",
            address="5678 Oak Ridge Way, Austin, TX 78701",
            sqft=1600,
            bedrooms=4,
            bathrooms=2.5,
            status="Active",
            created_at=now - timedelta(days=18),
            updated_at=now,
        )
        db.add(prop2)
        db.commit()

        # Seed price history for prop1
        ph1 = PropertyPriceHistory(
            id=str(uuid.uuid4()),
            property_id=prop1.id,
            price=475000.0,
            change_event="listed",
            recorded_at=now - timedelta(days=30),
        )
        ph2 = PropertyPriceHistory(
            id=str(uuid.uuid4()),
            property_id=prop1.id,
            price=450000.0,
            change_event="price_drop",
            recorded_at=now - timedelta(days=10),
        )
        db.add_all([ph1, ph2])

        # Seed price history for prop2
        ph3 = PropertyPriceHistory(
            id=str(uuid.uuid4()),
            property_id=prop2.id,
            price=520000.0,
            change_event="listed",
            recorded_at=now - timedelta(days=18),
        )
        db.add(ph3)
        db.commit()
