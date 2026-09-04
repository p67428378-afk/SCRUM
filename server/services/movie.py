import uuid
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from server.models import Movie, Genre
from server.schemas import MovieCreate, MovieUpdate


def get_movies(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    age_rating: Optional[str] = None,
    release_year: Optional[int] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    include_soft_deleted: bool = False,
) -> Tuple[List[Movie], int]:
    query = db.query(Movie)

    if not include_soft_deleted:
        if status:
            query = query.filter(Movie.status == status)
        else:
            query = query.filter(Movie.status != "SoftDeleted")
    elif status:
        query = query.filter(Movie.status == status)

    if genre:
        query = query.join(Movie.genres).filter(Genre.name.ilike(f"%{genre}%"))

    if age_rating:
        query = query.filter(Movie.age_rating.ilike(f"%{age_rating}%"))

    if release_year:
        query = query.filter(Movie.release_year == release_year)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Movie.title.ilike(search_pattern),
                Movie.description.ilike(search_pattern),
                Movie.cast_members.ilike(search_pattern),
            )
        )

    total = query.distinct().count()
    items = (
        query.distinct()
        .order_by(Movie.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_movie_by_id(
    db: Session, movie_id: str, include_soft_deleted: bool = False
) -> Movie:
    query = db.query(Movie).filter(Movie.id == movie_id)
    if not include_soft_deleted:
        query = query.filter(Movie.status != "SoftDeleted")
    movie = query.first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


def create_movie(db: Session, movie_in: MovieCreate) -> Movie:
    movie = Movie(
        id=str(uuid.uuid4()),
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
    db.add(movie)
    db.flush()

    if movie_in.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(movie_in.genre_ids)).all()
        movie.genres.extend(genres)
    if movie_in.genre_names:
        for name in movie_in.genre_names:
            g = db.query(Genre).filter(Genre.name.ilike(name)).first()
            if not g:
                g = Genre(id=str(uuid.uuid4()), name=name)
                db.add(g)
                db.flush()
            if g not in movie.genres:
                movie.genres.append(g)

    db.commit()
    db.refresh(movie)
    return movie


def update_movie(db: Session, movie_id: str, movie_in: MovieUpdate) -> Movie:
    movie = get_movie_by_id(db, movie_id, include_soft_deleted=True)

    update_data = movie_in.model_dump(exclude_unset=True)
    genre_ids = update_data.pop("genre_ids", None)
    genre_names = update_data.pop("genre_names", None)

    for field, value in update_data.items():
        setattr(movie, field, value)

    if genre_ids is not None:
        genres = db.query(Genre).filter(Genre.id.in_(genre_ids)).all()
        movie.genres = genres
    if genre_names is not None:
        new_genres = []
        for name in genre_names:
            g = db.query(Genre).filter(Genre.name.ilike(name)).first()
            if not g:
                g = Genre(id=str(uuid.uuid4()), name=name)
                db.add(g)
                db.flush()
            new_genres.append(g)
        movie.genres = new_genres

    db.commit()
    db.refresh(movie)
    return movie


def soft_delete_movie(db: Session, movie_id: str) -> Movie:
    movie = get_movie_by_id(db, movie_id, include_soft_deleted=True)
    movie.status = "SoftDeleted"
    db.commit()
    db.refresh(movie)
    return movie
