
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.SearchResult])
def search_books(query: str, type: str, db: Session = Depends(get_db)):
    return crud.search_books(db=db, query=query, type=type)
