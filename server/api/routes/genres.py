from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import GenreCreate, GenreResponse
from server.services import catalog as catalog_service
from server.api.deps import require_admin

router = APIRouter(prefix="/genres", tags=["genres"])


@router.get("", response_model=List[GenreResponse])
def list_genres(db: Session = Depends(get_db)):
    return catalog_service.get_all_genres(db)


@router.post("", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
def create_genre(
    genre_in: GenreCreate, db: Session = Depends(get_db), admin=Depends(require_admin)
):
    return catalog_service.create_genre_if_not_exists(db, genre_in.name)
