from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.get("", response_model=List[schemas.Order])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crud.get_orders(db=db, skip=skip, limit=limit, status=status_filter)


@router.post("", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_order(db=db, order_in=order_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = crud.get_order_by_id(db=db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found",
        )
    return order
