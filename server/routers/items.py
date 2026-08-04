from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import crud, schemas

router = APIRouter()


@router.post(
    "/items", response_model=schemas.ItemResponse, status_code=status.HTTP_201_CREATED
)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    existing = crud.get_item_by_sku(db, sku=item.sku)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item with SKU '{item.sku}' already exists",
        )
    return crud.create_item(db, item=item)


@router.get("/items", response_model=schemas.ItemListResponse)
def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, items = crud.get_items(db, skip=skip, limit=limit)
    return schemas.ItemListResponse(total=total, items=items)


@router.get("/items/{item_id}", response_model=schemas.ItemResponse)
def get_item(item_id: str, db: Session = Depends(get_db)):
    db_item = crud.get_item_by_id(db, item_id=item_id)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID '{item_id}' not found",
        )
    return db_item


@router.put("/items/{item_id}", response_model=schemas.ItemResponse)
def update_item(
    item_id: str, item_update: schemas.ItemUpdate, db: Session = Depends(get_db)
):
    updated_item = crud.update_item(db, item_id=item_id, item_update=item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID '{item_id}' not found",
        )
    return updated_item
