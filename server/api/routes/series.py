from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import (
    SeriesCreate,
    SeriesUpdate,
    SeriesResponse,
    SeasonCreate,
    SeasonResponse,
    EpisodeCreate,
    EpisodeResponse,
)
from server.services import series as series_service
from server.api.deps import get_current_active_admin, get_optional_current_user

router = APIRouter(tags=["series"])


@router.get("/series", response_model=List[SeriesResponse])
@router.get("/series/", response_model=List[SeriesResponse])
def list_series(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    release_year: Optional[int] = None,
    age_rating: Optional[str] = None,
    search: Optional[str] = None,
    status_param: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_role = str(current_user.role) if current_user else "user"
    return series_service.get_series_list(
        db,
        skip=skip,
        limit=limit,
        genre=genre,
        release_year=release_year,
        age_rating=age_rating,
        search=search,
        status=status_param,
        user_role=user_role,
    )


@router.get("/series/{series_id}", response_model=SeriesResponse)
def get_series(
    series_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_role = str(current_user.role) if current_user else "user"
    series = series_service.get_series_by_id(
        db, series_id=series_id, user_role=user_role
    )
    if not series:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TV Series not found"
        )
    return series


@router.post(
    "/series", response_model=SeriesResponse, status_code=status.HTTP_201_CREATED
)
@router.post(
    "/series/", response_model=SeriesResponse, status_code=status.HTTP_201_CREATED
)
def create_series(
    series_in: SeriesCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    return series_service.create_series(db, series_in=series_in)


@router.put("/series/{series_id}", response_model=SeriesResponse)
def update_series(
    series_id: str,
    series_in: SeriesUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    updated = series_service.update_series(db, series_id=series_id, series_in=series_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TV Series not found"
        )
    return updated


@router.delete("/series/{series_id}", response_model=SeriesResponse)
def delete_series(
    series_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    deleted = series_service.soft_delete_series(db, series_id=series_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TV Series not found"
        )
    return deleted


@router.post(
    "/series/{series_id}/seasons",
    response_model=SeasonResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_season(
    series_id: str,
    season_in: SeasonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    season = series_service.add_season(db, series_id=series_id, season_in=season_in)
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TV Series not found"
        )
    return season


@router.post(
    "/seasons/{season_id}/episodes",
    response_model=EpisodeResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/series/seasons/{season_id}/episodes",
    response_model=EpisodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_episode(
    season_id: str,
    episode_in: EpisodeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    episode = series_service.add_episode(db, season_id=season_id, episode_in=episode_in)
    if not episode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Season not found"
        )
    return episode
