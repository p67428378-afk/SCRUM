from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from server.database import get_db
from server.models import Item, Inventory, User
from server.schemas import ItemCreate, ItemUpdate, ItemResponse
from server.auth import RoleChecker

router = APIRouter(prefix="/items", tags=["Grocery Items"])

# Access control dependencies
require_admin_or_manager = RoleChecker(["Admin", "Manager"])
require_admin = RoleChecker(["Admin"])


@router.get("", response_model=List[ItemResponse])
def list_items(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Item).filter(Item.is_deleted == False)

    if category:
        query = query.filter(Item.category == category)

    if search:
        query = query.filter(
            (Item.name.ilike(f"%{search}%")) | (Item.sku.ilike(f"%{search}%"))
        )

    return query.offset(skip).limit(limit).all()


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    # Check if SKU already exists
    existing_item = (
        db.query(Item)
        .filter(Item.sku == item_data.sku, Item.is_deleted == False)
        .first()
    )
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already exists."
        )

    # Create item
    new_item = Item(
        sku=item_data.sku,
        name=item_data.name,
        category=item_data.category,
        unit_price=item_data.unit_price,
        cost_price=item_data.cost_price,
        unit_of_measure=item_data.unit_of_measure,
        supplier_name=item_data.supplier_name,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Initialize inventory
    new_inventory = Inventory(
        item_id=new_item.id,
        current_stock=item_data.initial_stock,
        reorder_threshold=item_data.reorder_threshold,
    )
    db.add(new_inventory)
    db.commit()

    return new_item


@router.put("/{id}", response_model=ItemResponse)
def update_item(
    id: str,
    item_data: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    item = db.query(Item).filter(Item.id == id, Item.is_deleted == False).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )

    update_dict = item_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    item = db.query(Item).filter(Item.id == id, Item.is_deleted == False).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )

    item.is_deleted = True
    db.commit()
    return None
