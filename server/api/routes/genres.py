from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Genre, User
from server.schemas import GenreCreate, GenreResponse
from server.api.deps import get_current_active_admin

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("", response_model=List[GenreResponse])
@router.get("/", response_model=List[GenreResponse])
def list_genres(db: Session = Depends(get_db)):
    return db.query(Genre).order_by(Genre.name).all()


@router.post("", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
def create_genre(
    genre_in: GenreCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    existing = db.query(Genre).filter(Genre.name == genre_in.name).first()
    if existing:
        return existing

    genre = Genre(name=genre_in.name)
    db.add(genre)
    db.commit()
    db.refresh(genre)
    return genre
