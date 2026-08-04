from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from server.database import get_db
from server import crud, schemas

router = APIRouter()


@router.get("/inventory", response_model=schemas.InventoryListResponse)
def get_inventory(
    warehouse_id: Optional[str] = Query(None, description="Filter by warehouse ID"),
    sku: Optional[str] = Query(None, description="Filter by SKU substring"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, items = crud.get_inventory_levels(
        db, warehouse_id=warehouse_id, sku=sku, skip=skip, limit=limit
    )
    return schemas.InventoryListResponse(total=total, items=items)
