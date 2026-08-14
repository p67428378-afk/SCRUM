import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category, MenuItem, User
from server.schemas import (
    CategoryCreate,
    CategoryResponse,
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse,
)
from server.auth import get_current_staff_or_admin

router = APIRouter(prefix="/api/v1/menu", tags=["Menu"])


# --- Categories ---
@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .order_by(Category.display_order.asc(), Category.name.asc())
        .all()
    )


@router.post(
    "/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED
)
def create_category(
    cat_data: CategoryCreate,
    current_staff: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(Category).filter(Category.name == cat_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists",
        )

    new_cat = Category(
        id=str(uuid.uuid4()),
        name=cat_data.name,
        display_order=cat_data.display_order,
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat


# --- Menu Items ---
@router.get("/items", response_model=List[MenuItemResponse])
def list_menu_items(
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    dietary_tag: Optional[str] = Query(
        None, description="Filter by dietary tag, e.g., Veg, Non-Veg"
    ),
    available_only: bool = Query(True, description="Only return available items"),
    search: Optional[str] = Query(
        None, description="Search term for item name or description"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem)

    if available_only:
        query = query.filter(MenuItem.is_available == True)

    if category_id:
        query = query.filter(MenuItem.category_id == category_id)

    if dietary_tag:
        query = query.filter(MenuItem.dietary_tags.ilike(f"%{dietary_tag}%"))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (MenuItem.name.ilike(search_term))
            | (MenuItem.description.ilike(search_term))
        )

    return query.order_by(MenuItem.name.asc()).all()


@router.post(
    "/items", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED
)
def create_menu_item(
    item_data: MenuItemCreate,
    current_staff: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == item_data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    new_item = MenuItem(
        id=str(uuid.uuid4()),
        category_id=item_data.category_id,
        name=item_data.name,
        description=item_data.description,
        price=item_data.price,
        image_url=item_data.image_url,
        dietary_tags=item_data.dietary_tags,
        is_available=item_data.is_available,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/items/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: str,
    item_data: MenuItemUpdate,
    current_staff: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found",
        )

    update_dict = item_data.model_dump(exclude_unset=True)

    if "category_id" in update_dict and update_dict["category_id"]:
        cat = (
            db.query(Category).filter(Category.id == update_dict["category_id"]).first()
        )
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    for field, value in update_dict.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item
