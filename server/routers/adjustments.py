from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import crud, schemas

router = APIRouter()


@router.post(
    "/stock-adjustments",
    response_model=schemas.StockAdjustmentResponse,
    status_code=status.HTTP_200_OK,
)
def create_stock_adjustment(
    adj: schemas.StockAdjustmentCreate, db: Session = Depends(get_db)
):
    try:
        return crud.create_stock_adjustment(db, adj=adj)
    except ValueError as e:
        err_str = str(e)
        if "not found" in err_str:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_str)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_str)


@router.post(
    "/stock-transfers",
    response_model=schemas.StockTransferResponse,
    status_code=status.HTTP_200_OK,
)
def create_stock_transfer(
    transfer: schemas.StockTransferCreate, db: Session = Depends(get_db)
):
    try:
        return crud.transfer_stock(db, transfer=transfer)
    except ValueError as e:
        err_str = str(e)
        if "not found" in err_str:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_str)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_str)


@router.get("/stock-adjustments", response_model=schemas.StockAdjustmentListResponse)
def list_stock_adjustments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, adjustments = crud.get_stock_adjustments(db, skip=skip, limit=limit)
    return schemas.StockAdjustmentListResponse(total=total, adjustments=adjustments)
