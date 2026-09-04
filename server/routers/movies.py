from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import MediaItem, User
from server.schemas import MovieCreate, MovieUpdate, MediaItemResponse
from server.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/api/v1/movies", tags=["movies"])


@router.get("", response_model=List[MediaItemResponse])
def list_movies(
    genre: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MediaItem).filter(MediaItem.type == "movie")
    if genre:
        query = query.filter(MediaItem.genre.ilike(f"%{genre}%"))
    if year:
        query = query.filter(MediaItem.release_year == year)

    if current_user.role != "admin":
        query = query.filter(MediaItem.is_published == True)

    movies = query.offset(skip).limit(limit).all()
    return movies


@router.post("", response_model=MediaItemResponse, status_code=status.HTTP_201_CREATED)
def create_movie(
    movie_in: MovieCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    if not movie_in.title or not movie_in.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie title is required and cannot be empty",
        )
    if not movie_in.genre or not movie_in.genre.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie genre is required and cannot be empty",
        )

    movie = MediaItem(
        type="movie",
        title=movie_in.title.strip(),
        description=movie_in.description,
        genre=movie_in.genre.strip(),
        release_year=movie_in.release_year,
        cast_members=movie_in.cast_members,
        rating=movie_in.rating,
        thumbnail_url=movie_in.thumbnail_url,
        stream_url=movie_in.stream_url,
        is_published=movie_in.is_published,
    )
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


@router.get("/{id}", response_model=MediaItemResponse)
def get_movie(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    movie = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "movie")
        .first()
    )
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )
    return movie


@router.put("/{id}", response_model=MediaItemResponse)
def update_movie(
    id: str,
    movie_in: MovieUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    movie = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "movie")
        .first()
    )
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )

    update_data = movie_in.model_dump(exclude_unset=True)
    if "title" in update_data and (
        not update_data["title"] or not update_data["title"].strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie title cannot be empty",
        )

    for field, value in update_data.items():
        setattr(movie, field, value)

    db.commit()
    db.refresh(movie)
    return movie


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(
    id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    movie = (
        db.query(MediaItem)
        .filter(MediaItem.id == id, MediaItem.type == "movie")
        .first()
    )
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found"
        )
    db.delete(movie)
    db.commit()
    return None
