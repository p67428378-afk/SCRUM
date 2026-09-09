import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from server.models import Base, User, ActorProfile, MediaAsset, FilmographyCredit
from server.core.security import get_password_hash

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_data(db: Session):
    try:
        # Seed test actor user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            test_user = User(
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                role="actor",
                is_active=True,
                is_verified=True,
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        # Seed profile for test actor
        profile = (
            db.query(ActorProfile).filter(ActorProfile.user_id == test_user.id).first()
        )
        if not profile:
            profile = ActorProfile(
                user_id=test_user.id,
                full_name="John Doe",
                slug="john-doe",
                bio="Experienced dramatic actor with background in classical theater and television.",
                height="5'10\"",
                eye_color="Brown",
                hair_color="Dark Brown",
                voice_type="Baritone",
                location="Los Angeles, CA",
                union_affiliations=["SAG-AFTRA", "Equity"],
                social_links={"instagram": "@johndoeactor", "imdb": "imdb.me/johndoe"},
                agent_contact_info={
                    "agency": "Creative Artists Agency",
                    "email": "agent@agency.com",
                    "phone": "+1-310-555-0199",
                },
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

            # Seed sample media asset
            media = MediaAsset(
                actor_id=profile.id,
                asset_type="headshot",
                url="https://images.unsplash.com/photo-1534528741775-53994a69daeb",
                title="Primary Commercial Headshot",
                is_primary=True,
                file_size_bytes=2048000,
            )
            db.add(media)

            reel = MediaAsset(
                actor_id=profile.id,
                asset_type="reel_link",
                url="https://www.youtube.com/embed/dQw4w9WgXcQ",
                title="2024 Drama Performance Reel",
                is_primary=False,
            )
            db.add(reel)

            resume = MediaAsset(
                actor_id=profile.id,
                asset_type="pdf_resume",
                url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                title="John Doe Theatrical Resume",
                is_primary=False,
                file_size_bytes=1024000,
            )
            db.add(resume)

            # Seed sample credits
            credit1 = FilmographyCredit(
                actor_id=profile.id,
                category="Film",
                production_name="Hamlet",
                role_name="Hamlet",
                director="Jane Doe",
                year=2024,
                additional_notes="Lead role",
            )
            credit2 = FilmographyCredit(
                actor_id=profile.id,
                category="Theater",
                production_name="Macbeth",
                role_name="Macbeth",
                director="John Smith",
                year=2023,
                additional_notes="Royal Shakespeare Company",
            )
            db.add_all([credit1, credit2])
            db.commit()

        # Seed admin user
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()

    except Exception:
        db.rollback()
