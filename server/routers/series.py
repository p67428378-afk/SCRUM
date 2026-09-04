from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import MediaItem, Season, Episode, User
from server.schemas import SeriesCreate, SeriesUpdate, MediaItemResponse
from server.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/v1/series", tags=["series"])


@router.get("", response_model=List[MediaItemResponse])
def list_series(
    genre: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MediaItem).filter(MediaItem.type == "series")
    if genre:
        query = query.filter(MediaItem.genre.ilike(f"%{genre}%"))
    if year:
        query = query.filter(MediaItem.release_year == year)

    if current_user.role != "admin":
        query = query.filter(MediaItem.is_published == True)

    series_list = query.offset(skip).limit(limit).all()
    return series_list


@router.post("", response_model=MediaItemResponse, status_code=status.HTTP_201_CREATED)
def create_series(
    series_in: SeriesCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    if not series_in.title or not series_in.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Series title is required and cannot be empty",
        )
    if not series_in.genre or not series_in.genre.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Series genre is required and cannot be empty",
        )

    series = MediaItem(
        type="series",
        title=series_in.title.strip(),
        description=series_in.description,
        genre=series_in.genre.strip(),
        release_year=series_in.release_year,
        cast_members=series_in.cast_members,
        rating=series_in.rating,
        thumbnail_url=series_in.thumbnail_url,
        stream_url="",
        is_published=series_in.is_published,
    )
    db.add(series)
    db.flush()

    if series_in.seasons:
        for s_data in series_in.seasons:
            season = Season(
                media_item_id=series.id,
                season_number=s_data.season_number,
                title=s_data.title or f"Season {s_data.season_number}",
            )
            db.add(season)
            db.flush()

            if s_data.episodes:
                for ep_data in s_data.episodes:
                    episode = Episode(
                        season_id=season.id,
                        episode_number=ep_data.episode_number,
                        title=ep_data.title,
                        description=ep_data.description,
                        stream_url=ep_data.stream_url,
                        duration_seconds=ep_data.duration_seconds,
                    )
                    db.add(episode)

    db.commit()
    db.refresh(series)
    return series


@router.get("/{id}", response_model=MediaItemResponse)
def get_series(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    series = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "series")
        .first()
    )
    if not series:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Series not found"
        )
    return series


@router.put("/{id}", response_model=MediaItemResponse)
def update_series(
    id: str,
    series_in: SeriesUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    series = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "series")
        .first()
    )
    if not series:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Series not found"
        )

    update_data = series_in.model_dump(exclude_unset=True)
    if "title" in update_data and (
        not update_data["title"] or not update_data["title"].strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Series title cannot be empty",
        )

    for field, value in update_data.items():
        setattr(series, field, value)

    db.commit()
    db.refresh(series)
    return series


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_series(
    id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    series = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "series")
        .first()
    )
    if not series:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Series not found"
        )
    db.delete(series)
    db.commit()
    return None
