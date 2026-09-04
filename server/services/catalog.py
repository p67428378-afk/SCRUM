from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from server.models import Genre
from server.services.movie import get_movies
from server.services.series import get_series_list


def get_all_genres(db: Session) -> List[Genre]:
    return db.query(Genre).order_by(Genre.name.asc()).all()


def create_genre_if_not_exists(db: Session, name: str) -> Genre:
    existing = db.query(Genre).filter(Genre.name.ilike(name)).first()
    if existing:
        return existing
    import uuid

    g = Genre(id=str(uuid.uuid4()), name=name)
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


def search_combined_catalog(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    age_rating: Optional[str] = None,
    release_year: Optional[int] = None,
    search: Optional[str] = None,
) -> Dict[str, Any]:
    movies, total_movies = get_movies(
        db,
        skip=skip,
        limit=limit,
        genre=genre,
        age_rating=age_rating,
        release_year=release_year,
        search=search,
        status="Available",
    )
    series_items, total_series = get_series_list(
        db,
        skip=skip,
        limit=limit,
        genre=genre,
        age_rating=age_rating,
        release_year=release_year,
        search=search,
        status="Available",
    )
    return {
        "movies": movies,
        "series": series_items,
        "total_movies": total_movies,
        "total_series": total_series,
        "skip": skip,
        "limit": limit,
    }
