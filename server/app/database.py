import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from server.app.config import settings

# Handle SQLite vs PostgreSQL dialect differences
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True
)

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


def seed_data(db: Session):
    from server.app import models
    from server.app.auth.utils import get_password_hash

    # 1. Seed Amenities
    amenity_names = [
        "Pool",
        "Garage",
        "Pet-Friendly",
        "Balcony",
        "Air Conditioning",
        "Gym",
        "Garden",
    ]
    existing_amenities = {a.name: a for a in db.query(models.Amenity).all()}
    created_amenities = {}
    for name in amenity_names:
        if name not in existing_amenities:
            amenity = models.Amenity(id=str(uuid.uuid4()), name=name)
            db.add(amenity)
            created_amenities[name] = amenity
        else:
            created_amenities[name] = existing_amenities[name]
    db.commit()

    # 2. Seed Users
    # Test Buyer (test@example.com / testpassword)
    test_buyer = (
        db.query(models.User).filter(models.User.email == "test@example.com").first()
    )
    if not test_buyer:
        test_buyer = models.User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Buyer",
            role="buyer",
            phone_number="555-0101",
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(test_buyer)

    # Admin User (admin@example.com / adminpassword)
    admin_user = (
        db.query(models.User).filter(models.User.email == "admin@example.com").first()
    )
    if not admin_user:
        admin_user = models.User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Agent",
            role="admin",
            phone_number="555-0100",
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin_user)

    # Sarah Jenkins Agent (sarah.jenkins@example.com / testpassword)
    sarah_agent = (
        db.query(models.User)
        .filter(models.User.email == "sarah.jenkins@example.com")
        .first()
    )
    if not sarah_agent:
        sarah_agent = models.User(
            id=str(uuid.uuid4()),
            email="sarah.jenkins@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Sarah Jenkins",
            role="seller_agent",
            phone_number="555-0199",
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(sarah_agent)

    db.commit()
    db.refresh(sarah_agent)

    # 3. Seed Sample Properties if empty
    property_count = db.query(models.Property).count()
    if property_count == 0:
        prop1 = models.Property(
            id=str(uuid.uuid4()),
            title="123 Maple St - Modern Family Home",
            description="Beautiful 3 bedroom house with open concept layout, modern kitchen, and spacious backyard in downtown Austin.",
            property_type="single_family",
            status="Active",
            price=450000.00,
            bedrooms=3,
            bathrooms=2.5,
            square_feet=2200,
            address_street="123 Maple St",
            city="Austin",
            state="TX",
            zip_code="78701",
            latitude=30.2672,
            longitude=-97.7431,
            owner_agent_id=sarah_agent.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(prop1)
        db.commit()
        db.refresh(prop1)

        # Attach image
        img1 = models.PropertyImage(
            id=str(uuid.uuid4()),
            property_id=prop1.id,
            image_url="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
            display_order=0,
            created_at=datetime.utcnow(),
        )
        db.add(img1)

        # Attach amenities
        if "Pool" in created_amenities:
            prop1.amenities.append(created_amenities["Pool"])
        if "Garage" in created_amenities:
            prop1.amenities.append(created_amenities["Garage"])

        prop2 = models.Property(
            id=str(uuid.uuid4()),
            title="Downtown Luxury Condo",
            description="High-rise condo with skyline views, floor-to-ceiling windows, and luxury amenities.",
            property_type="condo",
            status="Active",
            price=350000.00,
            bedrooms=2,
            bathrooms=2.0,
            square_feet=1200,
            address_street="456 Congress Ave",
            city="Austin",
            state="TX",
            zip_code="78701",
            latitude=30.2680,
            longitude=-97.7420,
            owner_agent_id=sarah_agent.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(prop2)
        db.commit()
        db.refresh(prop2)

        img2 = models.PropertyImage(
            id=str(uuid.uuid4()),
            property_id=prop2.id,
            image_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
            display_order=0,
            created_at=datetime.utcnow(),
        )
        db.add(img2)

        if "Air Conditioning" in created_amenities:
            prop2.amenities.append(created_amenities["Air Conditioning"])
        if "Gym" in created_amenities:
            prop2.amenities.append(created_amenities["Gym"])

        db.commit()
