from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models import Movie, Genre
from server.schemas import MovieCreate, MovieUpdate


def get_movies(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    release_year: Optional[int] = None,
    age_rating: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user_role: str = "user",
) -> List[Movie]:
    query = db.query(Movie)

    if user_role != "admin":
        query = query.filter(Movie.status == "Available")
    elif status:
        query = query.filter(Movie.status == status)

    if genre:
        query = query.join(Movie.genres).filter(
            or_(Genre.name.ilike(f"%{genre}%"), Genre.id == genre)
        )

    if release_year:
        query = query.filter(Movie.release_year == release_year)

    if age_rating:
        query = query.filter(Movie.age_rating.ilike(f"%{age_rating}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Movie.title.ilike(search_filter),
                Movie.description.ilike(search_filter),
                Movie.cast_members.ilike(search_filter),
            )
        )

    return query.offset(skip).limit(limit).all()


def get_movie_by_id(
    db: Session, movie_id: str, user_role: str = "user"
) -> Optional[Movie]:
    query = db.query(Movie).filter(Movie.id == movie_id)
    movie = query.first()
    if not movie:
        return None
    if user_role != "admin" and movie.status != "Available":
        return None
    return movie


def create_movie(db: Session, movie_in: MovieCreate) -> Movie:
    db_movie = Movie(
        title=movie_in.title,
        description=movie_in.description,
        duration=movie_in.duration,
        release_year=movie_in.release_year,
        age_rating=movie_in.age_rating,
        poster_url=movie_in.poster_url,
        trailer_url=movie_in.trailer_url,
        stream_url=movie_in.stream_url,
        cast_members=movie_in.cast_members,
        status=movie_in.status or "Available",
    )

    if movie_in.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(movie_in.genre_ids)).all()
        db_movie.genres = genres

    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie


def update_movie(db: Session, movie_id: str, movie_in: MovieUpdate) -> Optional[Movie]:
    db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not db_movie:
        return None

    update_data = movie_in.model_dump(exclude_unset=True)
    if "genre_ids" in update_data:
        genre_ids = update_data.pop("genre_ids")
        if genre_ids is not None:
            genres = db.query(Genre).filter(Genre.id.in_(genre_ids)).all()
            db_movie.genres = genres

    for field, value in update_data.items():
        setattr(db_movie, field, value)

    db.commit()
    db.refresh(db_movie)
    return db_movie


def soft_delete_movie(db: Session, movie_id: str) -> Optional[Movie]:
    db_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not db_movie:
        return None

    setattr(db_movie, "status", "SoftDeleted")
    db.commit()
    db.refresh(db_movie)
    return db_movie
