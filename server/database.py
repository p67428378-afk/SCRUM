import uuid
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError
from server.config import settings

# Setup engine with appropriate parameters for SQLite vs PostgreSQL
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args)
else:
    engine = create_engine(db_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=None) -> None:
    """Idempotently create all database tables."""
    # Import models so all tables are registered on Base.metadata
    from server import models  # noqa: F401

    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def seed_data(db: Session) -> None:
    """Idempotently seed required test users and initial cafe design posts."""
    from server.models import User, DesignPost, MediaAsset, ProjectBoard, Bookmark
    from server.auth import get_password_hash

    # 1. Seed Regular Cafe Owner User (test@example.com / testpassword)
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if not test_user:
        try:
            test_user = User(
                id=str(uuid.uuid4()),
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Alex River (Cafe Owner)",
                role="cafe_owner",
                is_active=True,
                is_verified=True,
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        except IntegrityError:
            db.rollback()
            test_user = db.query(User).filter(User.email == "test@example.com").first()

    # 2. Seed Admin / Designer User (admin@example.com / adminpassword)
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        try:
            admin_user = User(
                id=str(uuid.uuid4()),
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Studio Artisan Lead",
                role="designer",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        except IntegrityError:
            db.rollback()
            admin_user = (
                db.query(User).filter(User.email == "admin@example.com").first()
            )

    # 3. Seed Featured Interior Designer (designer@example.com / designerpassword)
    designer_user = db.query(User).filter(User.email == "designer@example.com").first()
    if not designer_user:
        try:
            designer_user = User(
                id=str(uuid.uuid4()),
                email="designer@example.com",
                hashed_password=get_password_hash("designerpassword"),
                full_name="Elena Rostova (Loft & Timber Design)",
                role="designer",
                is_active=True,
                is_verified=True,
            )
            db.add(designer_user)
            db.commit()
            db.refresh(designer_user)
        except IntegrityError:
            db.rollback()
            designer_user = (
                db.query(User).filter(User.email == "designer@example.com").first()
            )

    target_designer_id = (
        admin_user.id if admin_user else (designer_user.id if designer_user else None)
    )

    # 4. Seed Initial Design Posts if empty
    if target_designer_id and db.query(DesignPost).count() == 0:
        sample_posts = [
            {
                "title": "Industrial Botanical Espresso Sanctuary",
                "description": "An open-concept cafe space featuring exposed raw brick, polished concrete floors, matte black steel accents, and cascading biophilic hanging planters.",
                "style": "Industrial",
                "layout_size": "Medium (500-1500 sq ft)",
                "budget_tier": "Mid-Range ($$)",
                "color_scheme": "Emerald & Brass",
                "cover_image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
                "specifications": {
                    "seating_capacity": 42,
                    "bar_length_ft": 18,
                    "lighting_style": "Warm Edison Pendants (2700K)",
                    "flooring_material": "Sealed Microcement",
                    "acoustic_treatment": "Perforated Timber Ceiling Baffles",
                },
                "assets": [
                    {
                        "asset_type": "mood_board",
                        "filename": "industrial_botanical_moodboard.jpg",
                        "file_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200",
                        "file_type": "image/jpeg",
                        "file_size_bytes": 1024000,
                    },
                    {
                        "asset_type": "floor_plan",
                        "filename": "industrial_sanctuary_floorplan.pdf",
                        "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                        "file_type": "application/pdf",
                        "file_size_bytes": 2048000,
                    },
                    {
                        "asset_type": "material_spec",
                        "filename": "material_finishes_schedule.pdf",
                        "file_url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                        "file_type": "application/pdf",
                        "file_size_bytes": 1500000,
                    },
                ],
            },
            {
                "title": "Nordic Minimalist Brew Bar & Roastery",
                "description": "Light oak timber, neutral limewash plaster walls, sleek terrazzo counters, and abundant natural skylight tailored for specialty pour-over experiences.",
                "style": "Minimalist",
                "layout_size": "Small (< 500 sq ft)",
                "budget_tier": "Premium ($$$)",
                "color_scheme": "Warm Earth",
                "cover_image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
                "specifications": {
                    "seating_capacity": 20,
                    "bar_length_ft": 12,
                    "lighting_style": "Recessed Linear LED & Diffused Dome Lamps",
                    "flooring_material": "Custom Terrazzo Tile",
                    "acoustic_treatment": "Felt Acoustic Wall Panels",
                },
                "assets": [
                    {
                        "asset_type": "mood_board",
                        "filename": "nordic_minimalist_mood.jpg",
                        "file_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200",
                        "file_type": "image/jpeg",
                        "file_size_bytes": 1200000,
                    }
                ],
            },
            {
                "title": "Vintage Parisian Bistro & Patisserie Lounge",
                "description": "Classic checkered marble tiles, bentwood Thonet chairs, brass fluted sconces, and deep burgundy velvet banquet seating evoking timeless European charm.",
                "style": "Vintage",
                "layout_size": "Large (> 1500 sq ft)",
                "budget_tier": "Luxury ($$$$)",
                "color_scheme": "Dark & Moody",
                "cover_image_url": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800",
                "specifications": {
                    "seating_capacity": 65,
                    "bar_length_ft": 24,
                    "lighting_style": "Antique Brass Chandeliers",
                    "flooring_material": "Black & White Honed Marble",
                    "acoustic_treatment": "Tufted Velvet Wall Paneling",
                },
                "assets": [
                    {
                        "asset_type": "mood_board",
                        "filename": "parisian_bistro_mood.jpg",
                        "file_url": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200",
                        "file_type": "image/jpeg",
                        "file_size_bytes": 1400000,
                    }
                ],
            },
        ]

        for p_data in sample_posts:
            post_id = str(uuid.uuid4())
            assets_data = p_data.pop("assets", [])
            post = DesignPost(id=post_id, designer_id=target_designer_id, **p_data)
            db.add(post)
            db.flush()

            for asset in assets_data:
                ma = MediaAsset(
                    id=str(uuid.uuid4()),
                    post_id=post_id,
                    asset_type=asset["asset_type"],
                    filename=asset["filename"],
                    file_url=asset["file_url"],
                    file_type=asset["file_type"],
                    file_size_bytes=asset["file_size_bytes"],
                    status="attached",
                )
                db.add(ma)

        # Also create a default sample board for test_user
        if test_user:
            board_id = str(uuid.uuid4())
            sample_board = ProjectBoard(
                id=board_id,
                user_id=test_user.id,
                name="Downtown Cafe Inspo 2026",
                description="Ideas and layout floor plans for our flagship opening on 4th street.",
                is_private=False,
            )
            db.add(sample_board)
            db.flush()

            first_post = db.query(DesignPost).first()
            if first_post:
                bm = Bookmark(
                    id=str(uuid.uuid4()),
                    board_id=board_id,
                    post_id=first_post.id,
                )
                db.add(bm)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
