from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


@router.post(
    "/adjust",
    response_model=schemas.InventoryTransaction,
    status_code=status.HTTP_200_OK,
)
def adjust_inventory(adjust_in: schemas.InventoryAdjust, db: Session = Depends(get_db)):
    try:
        transaction = crud.adjust_inventory(db=db, adjust_in=adjust_in)
        return transaction
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/alerts", response_model=List[schemas.TeaAlert])
def list_alerts(db: Session = Depends(get_db)):
    return crud.get_tea_alerts(db=db)
