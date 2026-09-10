from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])


@router.get("", response_model=List[schemas.InventoryItemResponse])
def list_inventory(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.InventoryItem).all()


@router.post(
    "",
    response_model=schemas.InventoryItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory_item(
    item_data: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Business rule: Negative inventory quantities strictly rejected
    if item_data.quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Negative inventory quantities are strictly rejected",
        )

    item = models.InventoryItem(
        item_name=item_data.item_name,
        category=item_data.category,
        quantity=item_data.quantity,
        unit=item_data.unit,
        reorder_threshold=item_data.reorder_threshold,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Check for low stock alert
    if item.quantity <= item.reorder_threshold:
        alert = models.OperationalAlert(
            alert_type="LOW_STOCK",
            severity="WARNING",
            message=f"Inventory item '{item.item_name}' is below reorder threshold ({item.quantity} {item.unit} remaining)",
            is_resolved=False,
        )
        db.add(alert)
        db.commit()

    return item


@router.patch("/{id}/adjust", response_model=schemas.InventoryItemResponse)
def adjust_inventory_stock(
    id: str,
    adjustment: schemas.StockAdjustment,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    if adjustment.new_quantity is not None:
        target_quantity = adjustment.new_quantity
    elif adjustment.quantity_delta is not None:
        target_quantity = item.quantity + adjustment.quantity_delta
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either quantity_delta or new_quantity",
        )

    # Business rule: Negative inventory quantities strictly rejected
    if target_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Negative inventory quantities are strictly rejected",
        )

    item.quantity = target_quantity
    db.commit()
    db.refresh(item)

    # Low stock alert check
    if item.quantity <= item.reorder_threshold:
        alert = models.OperationalAlert(
            alert_type="LOW_STOCK",
            severity="WARNING",
            message=f"Inventory item '{item.item_name}' dropped below reorder threshold ({item.quantity} {item.unit} remaining)",
            is_resolved=False,
        )
        db.add(alert)
        db.commit()

    return item
