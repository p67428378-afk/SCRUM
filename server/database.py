import os
import uuid
import bcrypt
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def seed_data(db: Session) -> None:
    from server.models import User, Genre, Movie, Series, Season, Episode

    # 1. Seed Users
    admin_email = "admin@example.com"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            password=get_password_hash("adminpassword"),
            role="admin",
            is_active=True,
        )
        db.add(admin_user)

    test_email = "test@example.com"
    test_user = db.query(User).filter(User.email == test_email).first()
    if not test_user:
        test_user = User(
            id=str(uuid.uuid4()),
            email=test_email,
            password=get_password_hash("testpassword"),
            role="user",
            is_active=True,
        )
        db.add(test_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

    # 2. Seed Genres
    default_genres = [
        "Sci-Fi",
        "Action",
        "Drama",
        "Comedy",
        "Horror",
        "Romance",
        "Thriller",
        "Animation",
        "Documentary",
    ]
    genre_objs = {}
    for name in default_genres:
        g = db.query(Genre).filter(Genre.name == name).first()
        if not g:
            g = Genre(id=str(uuid.uuid4()), name=name)
            db.add(g)
            try:
                db.commit()
                db.refresh(g)
            except IntegrityError:
                db.rollback()
                g = db.query(Genre).filter(Genre.name == name).first()
        genre_objs[name] = g

    # 3. Seed Sample Movie
    movie_count = db.query(Movie).count()
    if movie_count == 0:
        sample_movie = Movie(
            id=str(uuid.uuid4()),
            title="Inception",
            description="A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            duration=148,
            release_year=2010,
            age_rating="PG-13",
            poster_url="https://image.tmdb.org/t/p/w500/9gk14781.jpg",
            trailer_url="https://www.youtube.com/watch?v=YoHD9XEInc0",
            stream_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            cast_members="Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
            status="Available",
        )
        if genre_objs.get("Sci-Fi"):
            sample_movie.genres.append(genre_objs["Sci-Fi"])
        if genre_objs.get("Action"):
            sample_movie.genres.append(genre_objs["Action"])
        db.add(sample_movie)

    # 4. Seed Sample TV Series with Season and Episodes
    series_count = db.query(Series).count()
    if series_count == 0:
        sample_series = Series(
            id=str(uuid.uuid4()),
            title="Stranger Things",
            description="When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            release_year=2016,
            age_rating="TV-14",
            poster_url="https://image.tmdb.org/t/p/w500/x2LSRK2CmP36.jpg",
            trailer_url="https://www.youtube.com/watch?v=b9EkMc79ZSU",
            cast_members="Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
            status="Available",
        )
        if genre_objs.get("Sci-Fi"):
            sample_series.genres.append(genre_objs["Sci-Fi"])
        if genre_objs.get("Drama"):
            sample_series.genres.append(genre_objs["Drama"])
        db.add(sample_series)
        db.flush()

        season_1 = Season(
            id=str(uuid.uuid4()),
            series_id=sample_series.id,
            season_number=1,
            title="Season 1",
        )
        db.add(season_1)
        db.flush()

        ep1 = Episode(
            id=str(uuid.uuid4()),
            season_id=season_1.id,
            episode_number=1,
            title="Chapter One: The Vanishing of Will Byers",
            runtime=48,
            thumbnail_url="https://image.tmdb.org/t/p/w500/ep1.jpg",
            stream_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        )
        ep2 = Episode(
            id=str(uuid.uuid4()),
            season_id=season_1.id,
            episode_number=2,
            title="Chapter Two: The Weirdo on Maple Street",
            runtime=55,
            thumbnail_url="https://image.tmdb.org/t/p/w500/ep2.jpg",
            stream_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        )
        db.add_all([ep1, ep2])

    try:
        db.commit()
    except Exception:
        db.rollback()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
