from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from server.database import get_db
from server import crud, schemas

router = APIRouter()


@router.post(
    "/warehouses",
    response_model=schemas.WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_warehouse(warehouse: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    existing = crud.get_warehouse_by_code(db, code=warehouse.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Warehouse with code '{warehouse.code}' already exists",
        )
    return crud.create_warehouse(db, warehouse=warehouse)


@router.get("/warehouses", response_model=List[schemas.WarehouseResponse])
def list_warehouses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return crud.get_warehouses(db, skip=skip, limit=limit)
