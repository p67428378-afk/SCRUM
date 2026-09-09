from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1/quality-logs", tags=["quality-logs"])


@router.get("", response_model=List[schemas.QualityLog])
def list_quality_logs(
    skip: int = 0,
    limit: int = 100,
    recipe_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crud.get_quality_logs(db=db, skip=skip, limit=limit, recipe_id=recipe_id)


@router.post("", response_model=schemas.QualityLog, status_code=status.HTTP_201_CREATED)
def create_quality_log(log_in: schemas.QualityLogCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_quality_log(db=db, log_in=log_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
