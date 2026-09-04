import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from server.config import settings

# Create engine
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

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
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


def seed_data(db):
    from server.models import User, MediaItem, Season, Episode
    from server.auth import get_password_hash
    from sqlalchemy.exc import IntegrityError

    # Seed subscriber account
    sub = db.query(User).filter(User.email == "test@example.com").first()
    if not sub:
        sub = User(
            id=str(uuid.uuid4()),
            email="test@example.com",
            hashed_password=get_password_hash("testpassword"),
            full_name="Test Subscriber",
            role="subscriber",
            is_active=True,
        )
        db.add(sub)

    # Seed admin account
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin User",
            role="admin",
            is_active=True,
        )
        db.add(admin)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # Seed sample media if catalog is empty
    sample_media_count = db.query(MediaItem).count()
    if sample_media_count == 0:
        st = MediaItem(
            id=str(uuid.uuid4()),
            type="series",
            title="Stranger Things",
            description="When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            genre="Sci-Fi",
            release_year=2016,
            cast_members="Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
            rating="TV-MA",
            thumbnail_url="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800",
            stream_url="",
            is_published=True,
        )
        db.add(st)
        db.flush()

        season1 = Season(
            id=str(uuid.uuid4()), media_item_id=st.id, season_number=1, title="Season 1"
        )
        db.add(season1)
        db.flush()

        ep1 = Episode(
            id=str(uuid.uuid4()),
            season_id=season1.id,
            episode_number=1,
            title="Chapter One: The Vanishing of Will Byers",
            description="On his way home from a friend's house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.",
            stream_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            duration_seconds=2880,
        )
        db.add(ep1)

        movie = MediaItem(
            id=str(uuid.uuid4()),
            type="movie",
            title="Interstellar",
            description="A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
            genre="Sci-Fi",
            release_year=2014,
            cast_members="Matthew McConaughey, Anne Hathaway, Jessica Chastain",
            rating="PG-13",
            thumbnail_url="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800",
            stream_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            is_published=True,
        )
        db.add(movie)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
