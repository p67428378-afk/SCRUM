from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models import Series, Season, Episode, Genre
from server.schemas import SeriesCreate, SeriesUpdate, SeasonCreate, EpisodeCreate


def get_series_list(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    release_year: Optional[int] = None,
    age_rating: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    user_role: str = "user",
) -> List[Series]:
    query = db.query(Series)

    if user_role != "admin":
        query = query.filter(Series.status == "Available")
    elif status:
        query = query.filter(Series.status == status)

    if genre:
        query = query.join(Series.genres).filter(
            or_(Genre.name.ilike(f"%{genre}%"), Genre.id == genre)
        )

    if release_year:
        query = query.filter(Series.release_year == release_year)

    if age_rating:
        query = query.filter(Series.age_rating.ilike(f"%{age_rating}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Series.title.ilike(search_filter),
                Series.description.ilike(search_filter),
                Series.cast_members.ilike(search_filter),
            )
        )

    return query.offset(skip).limit(limit).all()


def get_series_by_id(
    db: Session, series_id: str, user_role: str = "user"
) -> Optional[Series]:
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        return None
    if user_role != "admin" and series.status != "Available":
        return None
    return series


def create_series(db: Session, series_in: SeriesCreate) -> Series:
    db_series = Series(
        title=series_in.title,
        description=series_in.description,
        release_year=series_in.release_year,
        age_rating=series_in.age_rating,
        poster_url=series_in.poster_url,
        trailer_url=series_in.trailer_url,
        cast_members=series_in.cast_members,
        status=series_in.status or "Available",
    )

    if series_in.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(series_in.genre_ids)).all()
        db_series.genres = genres

    db.add(db_series)
    db.commit()
    db.refresh(db_series)
    return db_series


def update_series(
    db: Session, series_id: str, series_in: SeriesUpdate
) -> Optional[Series]:
    db_series = db.query(Series).filter(Series.id == series_id).first()
    if not db_series:
        return None

    update_data = series_in.model_dump(exclude_unset=True)
    if "genre_ids" in update_data:
        genre_ids = update_data.pop("genre_ids")
        if genre_ids is not None:
            genres = db.query(Genre).filter(Genre.id.in_(genre_ids)).all()
            db_series.genres = genres

    for field, value in update_data.items():
        setattr(db_series, field, value)

    db.commit()
    db.refresh(db_series)
    return db_series


def soft_delete_series(db: Session, series_id: str) -> Optional[Series]:
    db_series = db.query(Series).filter(Series.id == series_id).first()
    if not db_series:
        return None

    setattr(db_series, "status", "SoftDeleted")
    db.commit()
    db.refresh(db_series)
    return db_series


def add_season(
    db: Session, series_id: str, season_in: SeasonCreate
) -> Optional[Season]:
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        return None

    db_season = Season(
        series_id=series_id,
        season_number=season_in.season_number,
        title=season_in.title,
    )
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season


def add_episode(
    db: Session, season_id: str, episode_in: EpisodeCreate
) -> Optional[Episode]:
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        return None

    db_episode = Episode(
        season_id=season_id,
        episode_number=episode_in.episode_number,
        title=episode_in.title,
        runtime=episode_in.runtime,
        thumbnail_url=episode_in.thumbnail_url,
        stream_url=episode_in.stream_url,
    )
    db.add(db_episode)
    db.commit()
    db.refresh(db_episode)
    return db_episode
