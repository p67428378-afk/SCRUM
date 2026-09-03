from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import MenuItem
from server.schemas import MenuItemCreate, MenuItemResponse, MenuItemUpdate

router = APIRouter()


@router.get("", response_model=List[MenuItemResponse])
@router.get("/", response_model=List[MenuItemResponse])
def get_menu_items(
    category: Optional[str] = Query(
        None, description="Filter by category (Beverages, Food, Desserts)"
    ),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem)
    if category:
        query = query.filter(MenuItem.category.ilike(category))
    if is_available is not None:
        query = query.filter(MenuItem.is_available == is_available)
    return query.all()


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db)):
    menu_item = MenuItem(
        name=item_in.name,
        category=item_in.category,
        price=item_in.price,
        description=item_in.description,
        is_available=item_in.is_available,
    )
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return menu_item


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found"
        )
    return item


@router.put("/{item_id}", response_model=MenuItemResponse)
@router.patch("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: str, item_in: MenuItemUpdate, db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found"
        )

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found"
        )
    db.delete(item)
    db.commit()
    return None
