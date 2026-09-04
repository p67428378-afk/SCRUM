from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from server.models import Movie, Series, Genre


def search_catalog(
    db: Session, query_str: str, skip: int = 0, limit: int = 20, user_role: str = "user"
) -> Dict[str, Any]:
    movie_q = db.query(Movie)
    series_q = db.query(Series)

    if user_role != "admin":
        movie_q = movie_q.filter(Movie.status == "Available")
        series_q = series_q.filter(Series.status == "Available")

    search_filter = f"%{query_str}%"
    movies = (
        movie_q.filter(
            or_(
                Movie.title.ilike(search_filter),
                Movie.description.ilike(search_filter),
                Movie.cast_members.ilike(search_filter),
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    series = (
        series_q.filter(
            or_(
                Series.title.ilike(search_filter),
                Series.description.ilike(search_filter),
                Series.cast_members.ilike(search_filter),
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"movies": movies, "series": series}


def get_catalog_stats(db: Session) -> Dict[str, int]:
    total_movies = (
        db.query(func.count(Movie.id)).filter(Movie.status != "SoftDeleted").scalar()
        or 0
    )
    total_series = (
        db.query(func.count(Series.id)).filter(Series.status != "SoftDeleted").scalar()
        or 0
    )
    total_genres = db.query(func.count(Genre.id)).scalar() or 0

    return {
        "total_titles": total_movies + total_series,
        "total_movies": total_movies,
        "total_series": total_series,
        "total_genres": total_genres,
    }
