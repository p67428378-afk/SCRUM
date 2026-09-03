import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError

from server.config import settings
from server.models import Base, User, DesignPost, MediaAsset, ProjectBoard, Bookmark

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
    if "sqlite" in settings.DATABASE_URL
    else {},
)

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
    from server.auth import get_password_hash

    # Seed Default User (Owner)
    try:
        user1 = db.query(User).filter(User.email == "test@example.com").first()
        if not user1:
            user1 = User(
                email="test@example.com",
                hashed_password=get_password_hash("testpassword"),
                full_name="Alex Morgan",
                role="owner",
                bio="Independent specialty coffee shop owner planning a new downtown roastery location.",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                is_active=True,
                is_verified=True,
            )
            db.add(user1)
            db.commit()
            db.refresh(user1)
    except IntegrityError:
        db.rollback()
        user1 = db.query(User).filter(User.email == "test@example.com").first()

    # Seed Admin User
    try:
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("adminpassword"),
                full_name="Portal Administrator",
                role="admin",
                bio="Platform administrative supervisor.",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
    except IntegrityError:
        db.rollback()

    # Seed Designer User
    try:
        designer_user = (
            db.query(User).filter(User.email == "designer@example.com").first()
        )
        if not designer_user:
            designer_user = User(
                email="designer@example.com",
                hashed_password=get_password_hash("designerpassword"),
                full_name="Elena Rostova",
                role="designer",
                bio="Award-winning commercial interior architect specializing in European minimalist, Japandi, and industrial cafe spaces.",
                avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
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

    # Seed Sample Design Concepts
    if designer_user:
        existing_posts = db.query(DesignPost).count()
        if existing_posts == 0:
            posts_data = [
                {
                    "title": "Nordic Minimalist Espresso Atelier",
                    "description": "Clean lines, light birch woodwork, brushed brass accents, and an open bar flow optimized for high-volume barista craft and tranquil customer seating.",
                    "style": "Scandinavian",
                    "layout_size": "Medium (500-1500 sq ft)",
                    "budget_tier": "Mid-Range ($$)",
                    "color_scheme": "Pastel",
                    "cover_image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
                    "media_assets": [
                        {
                            "asset_type": "mood_board",
                            "file_name": "nordic_moodboard.jpg",
                            "file_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
                            "file_size_bytes": 2400000,
                            "mime_type": "image/jpeg",
                        },
                        {
                            "asset_type": "floor_plan",
                            "file_name": "nordic_floor_plan.pdf",
                            "file_url": "https://example.com/assets/nordic_floor_plan.pdf",
                            "file_size_bytes": 1850000,
                            "mime_type": "application/pdf",
                        },
                        {
                            "asset_type": "material_spec",
                            "file_name": "material_specs_nordic.pdf",
                            "file_url": "https://example.com/assets/material_specs_nordic.pdf",
                            "file_size_bytes": 980000,
                            "mime_type": "application/pdf",
                        },
                    ],
                },
                {
                    "title": "Industrial Raw Brick & Iron Roastery",
                    "description": "Exposed steel beams, distressed heritage brick, reclaimed timber communal tables, and custom matte black lighting for a dramatic industrial vibe.",
                    "style": "Industrial",
                    "layout_size": "Large (>1500 sq ft)",
                    "budget_tier": "Luxury ($$$)",
                    "color_scheme": "Dark Moody",
                    "cover_image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
                    "media_assets": [
                        {
                            "asset_type": "mood_board",
                            "file_name": "industrial_moodboard.jpg",
                            "file_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
                            "file_size_bytes": 3100000,
                            "mime_type": "image/jpeg",
                        },
                        {
                            "asset_type": "floor_plan",
                            "file_name": "industrial_floor_plan.pdf",
                            "file_url": "https://example.com/assets/industrial_floor_plan.pdf",
                            "file_size_bytes": 2200000,
                            "mime_type": "application/pdf",
                        },
                    ],
                },
                {
                    "title": "Botanical Greenhouse Micro-Cafe",
                    "description": "Lush hanging greenery, natural terracotta flooring, curved fluted counter edges, and sunlight-maximizing skylight integration for compact spaces.",
                    "style": "Modern",
                    "layout_size": "Compact (<500 sq ft)",
                    "budget_tier": "Economy ($)",
                    "color_scheme": "Warm Earthy",
                    "cover_image_url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
                    "media_assets": [
                        {
                            "asset_type": "mood_board",
                            "file_name": "botanical_moodboard.jpg",
                            "file_url": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
                            "file_size_bytes": 1900000,
                            "mime_type": "image/jpeg",
                        },
                    ],
                },
                {
                    "title": "Vintage Parisian Bistro & Patisserie",
                    "description": "Checkerboard marble flooring, antique mirrors, warm walnut woodwork, and curved brass railings evoking 1920s Parisian elegance.",
                    "style": "Vintage",
                    "layout_size": "Medium (500-1500 sq ft)",
                    "budget_tier": "Luxury ($$$)",
                    "color_scheme": "Monochrome",
                    "cover_image_url": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
                    "media_assets": [
                        {
                            "asset_type": "mood_board",
                            "file_name": "vintage_moodboard.jpg",
                            "file_url": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
                            "file_size_bytes": 2800000,
                            "mime_type": "image/jpeg",
                        },
                    ],
                },
            ]

            for p_data in posts_data:
                assets = p_data.pop("media_assets", [])
                post = DesignPost(designer_id=designer_user.id, **p_data)
                db.add(post)
                db.commit()
                db.refresh(post)

                for asset in assets:
                    ma = MediaAsset(post_id=post.id, **asset)
                    db.add(ma)
                db.commit()

    # Seed Sample Project Boards
    if user1:
        board_count = db.query(ProjectBoard).count()
        if board_count == 0:
            sample_board = ProjectBoard(
                user_id=user1.id,
                name="Downtown Cafe Inspo 2026",
                description="Selected layout and lighting ideas for our flagship coffee shop opening.",
                is_private=False,
            )
            db.add(sample_board)
            db.commit()
            db.refresh(sample_board)

            # Bookmark first post
            first_post = db.query(DesignPost).first()
            if first_post:
                bm = Bookmark(board_id=sample_board.id, post_id=first_post.id)
                db.add(bm)
                first_post.bookmark_count = 1
                db.commit()
