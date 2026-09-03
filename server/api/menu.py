from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import MenuItem
from server.schemas import MenuItemCreate, MenuItemResponse, MenuItemUpdate

router = APIRouter(prefix="/api/v1/menu", tags=["Menu"])


@router.get("", response_model=List[MenuItemResponse])
def get_menu_items(
    category: Optional[str] = Query(
        None, description="Filter by category (Beverages, Food, Desserts)"
    ),
    available_only: Optional[bool] = Query(
        None, description="Filter available items only"
    ),
    search: Optional[str] = Query(None, description="Search item by name"),
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem)
    if category and category.lower() != "all":
        query = query.filter(MenuItem.category.ilike(category))
    if available_only is not None:
        query = query.filter(MenuItem.is_available == available_only)
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search}%"))
    return query.all()


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db)):
    existing = db.query(MenuItem).filter(MenuItem.name.ilike(item_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Menu item with name '{item_in.name}' already exists.",
        )
    db_item = MenuItem(**item_in.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with id '{item_id}' not found.",
        )
    return db_item


@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: str, item_in: MenuItemUpdate, db: Session = Depends(get_db)
):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with id '{item_id}' not found.",
        )
    update_data = item_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != db_item.name:
        existing = (
            db.query(MenuItem).filter(MenuItem.name.ilike(update_data["name"])).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item with name '{update_data['name']}' already exists.",
            )

    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}/availability", response_model=MenuItemResponse)
def toggle_menu_item_availability(
    item_id: str,
    is_available: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with id '{item_id}' not found.",
        )

    if is_available is not None:
        db_item.is_available = is_available
    else:
        db_item.is_available = not db_item.is_available

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with id '{item_id}' not found.",
        )
    db.delete(db_item)
    db.commit()
    return None
