from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from server.database import get_db
from server.models import Item, Inventory, StockAdjustment, User
from server.schemas import (
    InventoryUpdate,
    InventoryResponse,
    LowStockResponse,
    StockAdjustmentCreate,
    StockAdjustmentResponse,
)
from server.auth import RoleChecker

router = APIRouter(prefix="/inventory", tags=["Inventory & Stock"])

# Access control dependencies
require_any_role = RoleChecker(["Admin", "Manager", "Staff"])


@router.get("/low-stock", response_model=List[LowStockResponse])
def list_low_stock(
    db: Session = Depends(get_db), current_user: User = Depends(require_any_role)
):
    # Join Inventory and Item to get low stock items
    results = (
        db.query(Inventory, Item)
        .join(Item, Inventory.item_id == Item.id)
        .filter(
            Item.is_deleted == False,
            Inventory.current_stock <= Inventory.reorder_threshold,
        )
        .all()
    )

    low_stock_list = []
    for inv, item in results:
        low_stock_list.append(
            LowStockResponse(
                item_id=inv.item_id,
                sku=item.sku,
                name=item.name,
                category=item.category,
                current_stock=inv.current_stock,
                reorder_threshold=inv.reorder_threshold,
                unit_of_measure=item.unit_of_measure,
            )
        )
    return low_stock_list


@router.put("/{item_id}", response_model=InventoryResponse)
def update_stock(
    item_id: str,
    inv_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    # Check if item exists and is not deleted
    item = db.query(Item).filter(Item.id == item_id, Item.is_deleted == False).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )

    # Check for negative stock
    if inv_data.current_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stock level cannot be negative.",
        )

    inventory = db.query(Inventory).filter(Inventory.item_id == item_id).first()
    if not inventory:
        inventory = Inventory(item_id=item_id)
        db.add(inventory)

    inventory.current_stock = inv_data.current_stock
    inventory.reorder_threshold = inv_data.reorder_threshold

    db.commit()
    db.refresh(inventory)
    return inventory


@router.post("/{item_id}/adjust", response_model=StockAdjustmentResponse)
def adjust_stock(
    item_id: str,
    adj_data: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    # Check if item exists and is not deleted
    item = db.query(Item).filter(Item.id == item_id, Item.is_deleted == False).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found."
        )

    inventory = db.query(Inventory).filter(Inventory.item_id == item_id).first()
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found."
        )

    # Calculate new stock level
    new_stock = inventory.current_stock + adj_data.quantity_changed
    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Adjustment results in a negative stock level.",
        )

    # Update stock level
    inventory.current_stock = new_stock

    # Create stock adjustment audit log
    adjustment = StockAdjustment(
        item_id=item_id,
        user_id=current_user.id,
        adjustment_type=adj_data.adjustment_type,
        quantity_changed=adj_data.quantity_changed,
        reason=adj_data.reason,
    )
    db.add(adjustment)
    db.commit()
    db.refresh(adjustment)

    return StockAdjustmentResponse(
        adjustment_id=adjustment.id,
        item_id=adjustment.item_id,
        new_stock=new_stock,
        adjustment_type=adjustment.adjustment_type,
        quantity_changed=adjustment.quantity_changed,
        reason=adjustment.reason,
        timestamp=adjustment.created_at,
    )
