from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from server.app.core.config import settings

DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

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
    from server.app.models.user import User
    from server.app.models.listing import DogListing
    from server.app.core.security import get_password_hash

    try:
        # 1. Seed test seller user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            test_user = User(
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Test Seller",
                role="seller",
                seller_rating=4.9,
                is_active=True,
                is_verified=True,
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        # 2. Seed admin user
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Admin User",
                role="admin",
                seller_rating=5.0,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # 3. Seed sample listings if empty
        existing_listing = db.query(DogListing).first()
        if not existing_listing and test_user:
            sample_listings = [
                DogListing(
                    seller_id=test_user.id,
                    title="Golden Retriever Puppy - Max",
                    breed="Golden Retriever",
                    age_months=3,
                    price=1200.00,
                    location="Seattle, WA",
                    description="Friendly, playful Golden Retriever puppy looking for a loving home. Health checked and vaccinated.",
                    health_records="Vaccinated, Microchipped, OFA Clearance, Vet Checked",
                    photo_urls=[
                        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
                    ],
                    status="available",
                ),
                DogListing(
                    seller_id=test_user.id,
                    title="French Bulldog Female - Bella",
                    breed="French Bulldog",
                    age_months=5,
                    price=2500.00,
                    location="Los Angeles, CA",
                    description="AKC Registered female French Bulldog. Beautiful cream coat, gentle temperament.",
                    health_records="AKC Registered, Full Vaccination, De-wormed",
                    photo_urls=[
                        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"
                    ],
                    status="available",
                ),
                DogListing(
                    seller_id=test_user.id,
                    title="German Shepherd Puppy - Rocky",
                    breed="German Shepherd",
                    age_months=4,
                    price=1500.00,
                    location="Denver, CO",
                    description="Smart and alert German Shepherd puppy from champion bloodlines.",
                    health_records="AKC Registered, First vaccinations, Health certificate",
                    photo_urls=[
                        "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80"
                    ],
                    status="available",
                ),
            ]
            db.add_all(sample_listings)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed data warning: {e}")
