from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import MovieCreate, MovieUpdate, MovieResponse, PaginatedResponse
from server.services import movie as movie_service
from server.api.deps import require_admin, get_optional_current_user
from server.models import User

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=PaginatedResponse[MovieResponse])
def list_movies(
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
    items, total = movie_service.get_movies(
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


@router.get("/{id}", response_model=MovieResponse)
def get_movie(
    id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    is_admin = current_user and current_user.role == "admin"
    return movie_service.get_movie_by_id(db, movie_id=id, include_soft_deleted=is_admin)


@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie_in: MovieCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return movie_service.create_movie(db, movie_in)


@router.put("/{id}", response_model=MovieResponse)
def update_movie(
    id: str,
    movie_in: MovieUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return movie_service.update_movie(db, movie_id=id, movie_in=movie_in)


@router.delete("/{id}", response_model=MovieResponse)
def delete_movie(
    id: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)
):
    return movie_service.soft_delete_movie(db, movie_id=id)
