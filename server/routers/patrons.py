
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Patron)
def create_patron(patron: schemas.PatronCreate, db: Session = Depends(get_db)):
    return crud.create_patron(db=db, patron=patron)

@router.get("/", response_model=List[schemas.Patron])
def read_patrons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patrons = crud.get_patrons(db, skip=skip, limit=limit)
    return patrons
