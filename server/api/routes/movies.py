from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import MovieCreate, MovieUpdate, MovieResponse
from server.services import movie as movie_service
from server.api.deps import get_current_active_admin, get_optional_current_user

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=List[MovieResponse])
@router.get("/", response_model=List[MovieResponse])
def list_movies(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    release_year: Optional[int] = None,
    age_rating: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_role = str(current_user.role) if current_user else "user"
    movies = movie_service.get_movies(
        db,
        skip=skip,
        limit=limit,
        genre=genre,
        release_year=release_year,
        age_rating=age_rating,
        search=search,
        status=status,
        user_role=user_role,
    )
    return movies


@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_role = str(current_user.role) if current_user else "user"
    movie = movie_service.get_movie_by_id(db, movie_id=movie_id, user_role=user_role)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )
    return movie


@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie_in: MovieCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    return movie_service.create_movie(db, movie_in=movie_in)


@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(
    movie_id: str,
    movie_in: MovieUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    updated = movie_service.update_movie(db, movie_id=movie_id, movie_in=movie_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )
    return updated


@router.delete("/{movie_id}", response_model=MovieResponse)
def delete_movie(
    movie_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    deleted = movie_service.soft_delete_movie(db, movie_id=movie_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )
    return deleted
