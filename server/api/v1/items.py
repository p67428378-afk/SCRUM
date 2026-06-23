from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from server.database import get_db
from server.schemas import (
    JewelryItemCreate,
    JewelryItemUpdate,
    JewelryItemResponse,
    PaginatedJewelryItems,
)
from server import crud

router = APIRouter(prefix="/api/v1/items", tags=["items"])


@router.post(
    "", response_model=JewelryItemResponse, status_code=status.HTTP_201_CREATED
)
def create_item(item: JewelryItemCreate, db: Session = Depends(get_db)):
    db_item = crud.get_jewelry_item_by_sku(db, sku=item.sku)
    if db_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists"
        )
    return crud.create_jewelry_item(db=db, item=item)


@router.get("", response_model=PaginatedJewelryItems)
def read_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    material: Optional[str] = None,
    gemstone_type: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    # Validate sort_by field
    if sort_by and sort_by not in [
        "price",
        "quantity",
        "name",
        "sku",
        "created_at",
        "updated_at",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort_by field: {sort_by}",
        )

    items, total = crud.get_jewelry_items(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        material=material,
        gemstone_type=gemstone_type,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/{item_id}", response_model=JewelryItemResponse)
def read_item(item_id: str, db: Session = Depends(get_db)):
    # Try to find by ID first, then by SKU
    db_item = crud.get_jewelry_item(db, item_id=item_id)
    if not db_item:
        db_item = crud.get_jewelry_item_by_sku(db, sku=item_id)

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return db_item


@router.put("/{item_id}", response_model=JewelryItemResponse)
def update_item(
    item_id: str, item_update: JewelryItemUpdate, db: Session = Depends(get_db)
):
    # Try to find by ID first, then by SKU
    db_item = crud.get_jewelry_item(db, item_id=item_id)
    if not db_item:
        db_item = crud.get_jewelry_item_by_sku(db, sku=item_id)

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    if item_update.sku:
        existing_sku_item = crud.get_jewelry_item_by_sku(db, sku=item_update.sku)
        if existing_sku_item and existing_sku_item.id != db_item.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists on another item",
            )

    updated_item = crud.update_jewelry_item(
        db=db, item_id=db_item.id, item_update=item_update
    )
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: str, db: Session = Depends(get_db)):
    # Try to find by ID first, then by SKU
    db_item = crud.get_jewelry_item(db, item_id=item_id)
    if not db_item:
        db_item = crud.get_jewelry_item_by_sku(db, sku=item_id)

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    success = crud.delete_jewelry_item(db=db, item_id=db_item.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return None


@router.post("/{item_id}/sale", response_model=JewelryItemResponse)
def make_sale(
    item_id: str, quantity_sold: int = Query(1, ge=1), db: Session = Depends(get_db)
):
    """
    Record a sale of an item, automatically decrementing its quantity.
    """
    # Try to find by ID first, then by SKU
    db_item = crud.get_jewelry_item(db, item_id=item_id)
    if not db_item:
        db_item = crud.get_jewelry_item_by_sku(db, sku=item_id)

    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    updated_item = crud.record_sale(
        db=db, item_id=db_item.id, quantity_sold=quantity_sold
    )
    return updated_item
