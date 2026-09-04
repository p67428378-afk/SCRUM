from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    SeriesCreate,
    SeriesUpdate,
    SeriesResponse,
    SeasonCreate,
    SeasonResponse,
    EpisodeCreate,
    EpisodeResponse,
    PaginatedResponse,
)
from server.services import series as series_service
from server.api.deps import require_admin, get_optional_current_user
from server.models import User

router = APIRouter(tags=["series"])


@router.get("/series", response_model=PaginatedResponse[SeriesResponse])
def list_series(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = Query(None),
    age_rating: Optional[str] = Query(None),
    release_year: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    is_admin = current_user and current_user.role == "admin"
    items, total = series_service.get_series_list(
        db,
        skip=skip,
        limit=limit,
        genre=genre,
        age_rating=age_rating,
        release_year=release_year,
        search=search,
        status=status_filter,
        include_soft_deleted=is_admin,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/series/{id}", response_model=SeriesResponse)
def get_series(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    is_admin = current_user and current_user.role == "admin"
    return series_service.get_series_by_id(
        db, series_id=id, include_soft_deleted=is_admin
    )


@router.post(
    "/series", response_model=SeriesResponse, status_code=status.HTTP_201_CREATED
)
def create_series(
    series_in: SeriesCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return series_service.create_series(db, series_in)


@router.put("/series/{id}", response_model=SeriesResponse)
def update_series(
    id: str,
    series_in: SeriesUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return series_service.update_series(db, series_id=id, series_in=series_in)


@router.delete("/series/{id}", response_model=SeriesResponse)
def delete_series(
    id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    return series_service.soft_delete_series(db, series_id=id)


@router.post(
    "/series/{id}/seasons",
    response_model=SeasonResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_season(
    id: str,
    season_in: SeasonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return series_service.add_season_to_series(db, series_id=id, season_in=season_in)


@router.post(
    "/seasons/{id}/episodes",
    response_model=EpisodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_episode(
    id: str,
    episode_in: EpisodeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return series_service.add_episode_to_season(db, season_id=id, episode_in=episode_in)
