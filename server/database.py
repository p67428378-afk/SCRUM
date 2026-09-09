import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")

connect_args = {}
engine_kwargs = {}

if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
    if ":memory:" in DATABASE_URL or os.getenv("TESTING") == "true":
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
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
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    from server.models import Credit, MediaAsset

    # Seed sample credits if empty
    if db.query(Credit).count() == 0:
        sample_credits = [
            Credit(
                category="television",
                production_title="City Lights (HBO)",
                role_name="Elena Vance",
                role_type="Lead",
                director="Sarah Jenkins",
                release_year=2024,
                notes="Critics' Choice Nominee; Season 2, Episodes 4-8",
            ),
            Credit(
                category="film",
                production_title="Shadows over Manhattan",
                role_name="Detective Miller",
                role_type="Supporting",
                director="David Fincher",
                release_year=2023,
                notes="Sundance Film Festival Official Selection",
            ),
            Credit(
                category="theater",
                production_title="Hamlet",
                role_name="Ophelia",
                role_type="Lead",
                director="Kenneth Branagh",
                release_year=2022,
                notes="Broadway Production",
            ),
            Credit(
                category="commercials",
                production_title="Luxury Perfume Campaign",
                role_name="Principal Actress",
                role_type="Lead",
                director="Sofia Coppola",
                release_year=2024,
                notes="Global Broadcast & Digital",
            ),
        ]
        db.add_all(sample_credits)
        db.commit()

    # Seed sample media assets if empty
    if db.query(MediaAsset).count() == 0:
        sample_assets = [
            MediaAsset(
                title="Dramatic Headshot 2024",
                media_type="headshot",
                thumbnail_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
                full_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=80",
                download_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=80",
                embed_code=None,
                is_primary=True,
                display_order=1,
            ),
            MediaAsset(
                title="Studio Portrait (8K DCI)",
                media_type="headshot",
                thumbnail_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
                full_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&q=80",
                download_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&q=80",
                embed_code=None,
                is_primary=False,
                display_order=2,
            ),
            MediaAsset(
                title="Dramatic Reel 2024",
                media_type="reel",
                thumbnail_url="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
                full_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                download_url=None,
                embed_code='<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>',
                is_primary=False,
                display_order=3,
            ),
            MediaAsset(
                title="Official Press Kit 2024",
                media_type="press_kit",
                thumbnail_url="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80",
                full_url="https://example.com/press-kit.pdf",
                download_url="https://example.com/press-kit.pdf",
                embed_code=None,
                is_primary=False,
                display_order=4,
            ),
        ]
        db.add_all(sample_assets)
        db.commit()
