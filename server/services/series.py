import uuid
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from server.models import Series, Season, Episode, Genre
from server.schemas import SeriesCreate, SeriesUpdate, SeasonCreate, EpisodeCreate


def get_series_list(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    genre: Optional[str] = None,
    age_rating: Optional[str] = None,
    release_year: Optional[int] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    include_soft_deleted: bool = False,
) -> Tuple[List[Series], int]:
    query = db.query(Series)

    if not include_soft_deleted:
        if status:
            query = query.filter(Series.status == status)
        else:
            query = query.filter(Series.status != "SoftDeleted")
    elif status:
        query = query.filter(Series.status == status)

    if genre:
        query = query.join(Series.genres).filter(Genre.name.ilike(f"%{genre}%"))

    if age_rating:
        query = query.filter(Series.age_rating.ilike(f"%{age_rating}%"))

    if release_year:
        query = query.filter(Series.release_year == release_year)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Series.title.ilike(search_pattern),
                Series.description.ilike(search_pattern),
                Series.cast_members.ilike(search_pattern),
            )
        )

    total = query.distinct().count()
    items = (
        query.distinct()
        .order_by(Series.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_series_by_id(
    db: Session, series_id: str, include_soft_deleted: bool = False
) -> Series:
    query = db.query(Series).filter(Series.id == series_id)
    if not include_soft_deleted:
        query = query.filter(Series.status != "SoftDeleted")
    series_obj = query.first()
    if not series_obj:
        raise HTTPException(status_code=404, detail="Series not found")
    return series_obj


def create_series(db: Session, series_in: SeriesCreate) -> Series:
    series_obj = Series(
        id=str(uuid.uuid4()),
        title=series_in.title,
        description=series_in.description,
        release_year=series_in.release_year,
        age_rating=series_in.age_rating,
        poster_url=series_in.poster_url,
        trailer_url=series_in.trailer_url,
        cast_members=series_in.cast_members,
        status=series_in.status or "Available",
    )
    db.add(series_obj)
    db.flush()

    if series_in.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(series_in.genre_ids)).all()
        series_obj.genres.extend(genres)
    if series_in.genre_names:
        for name in series_in.genre_names:
            g = db.query(Genre).filter(Genre.name.ilike(name)).first()
            if not g:
                g = Genre(id=str(uuid.uuid4()), name=name)
                db.add(g)
                db.flush()
            if g not in series_obj.genres:
                series_obj.genres.append(g)

    db.commit()
    db.refresh(series_obj)
    return series_obj


def update_series(db: Session, series_id: str, series_in: SeriesUpdate) -> Series:
    series_obj = get_series_by_id(db, series_id, include_soft_deleted=True)

    update_data = series_in.model_dump(exclude_unset=True)
    genre_ids = update_data.pop("genre_ids", None)
    genre_names = update_data.pop("genre_names", None)

    for field, value in update_data.items():
        setattr(series_obj, field, value)

    if genre_ids is not None:
        genres = db.query(Genre).filter(Genre.id.in_(genre_ids)).all()
        series_obj.genres = genres
    if genre_names is not None:
        new_genres = []
        for name in genre_names:
            g = db.query(Genre).filter(Genre.name.ilike(name)).first()
            if not g:
                g = Genre(id=str(uuid.uuid4()), name=name)
                db.add(g)
                db.flush()
            new_genres.append(g)
        series_obj.genres = new_genres

    db.commit()
    db.refresh(series_obj)
    return series_obj


def soft_delete_series(db: Session, series_id: str) -> Series:
    series_obj = get_series_by_id(db, series_id, include_soft_deleted=True)
    series_obj.status = "SoftDeleted"
    db.commit()
    db.refresh(series_obj)
    return series_obj


def add_season_to_series(
    db: Session, series_id: str, season_in: SeasonCreate
) -> Season:
    series_obj = get_series_by_id(db, series_id, include_soft_deleted=True)

    existing_season = (
        db.query(Season)
        .filter(
            Season.series_id == series_id,
            Season.season_number == season_in.season_number,
        )
        .first()
    )
    if existing_season:
        raise HTTPException(
            status_code=400,
            detail=f"Season number {season_in.season_number} already exists for this series",
        )

    season = Season(
        id=str(uuid.uuid4()),
        series_id=series_obj.id,
        season_number=season_in.season_number,
        title=season_in.title or f"Season {season_in.season_number}",
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    return season


def add_episode_to_season(
    db: Session, season_id: str, episode_in: EpisodeCreate
) -> Episode:
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")

    existing_episode = (
        db.query(Episode)
        .filter(
            Episode.season_id == season_id,
            Episode.episode_number == episode_in.episode_number,
        )
        .first()
    )
    if existing_episode:
        raise HTTPException(
            status_code=400,
            detail=f"Episode number {episode_in.episode_number} already exists in season {season.season_number}",
        )

    episode = Episode(
        id=str(uuid.uuid4()),
        season_id=season.id,
        episode_number=episode_in.episode_number,
        title=episode_in.title,
        runtime=episode_in.runtime,
        thumbnail_url=episode_in.thumbnail_url,
        stream_url=episode_in.stream_url,
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode
