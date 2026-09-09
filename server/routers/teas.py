from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1/teas", tags=["teas"])


@router.get("", response_model=List[schemas.Tea])
def list_teas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_teas(db=db, skip=skip, limit=limit)


@router.post("", response_model=schemas.Tea, status_code=status.HTTP_201_CREATED)
def create_tea(tea_in: schemas.TeaCreate, db: Session = Depends(get_db)):
    existing = crud.get_tea_by_name(db=db, name=tea_in.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tea with name '{tea_in.name}' already exists",
        )
    return crud.create_tea(db=db, tea_in=tea_in)


@router.get("/{tea_id}", response_model=schemas.Tea)
def get_tea(tea_id: str, db: Session = Depends(get_db)):
    tea = crud.get_tea_by_id(db=db, tea_id=tea_id)
    if not tea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tea with ID '{tea_id}' not found",
        )
    return tea
