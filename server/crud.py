import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from server import models, schemas


# Category CRUD
def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_cat = models.Category(
        id=str(uuid.uuid4()), name=category.name, description=category.description
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()


# Warehouse CRUD
def get_warehouse_by_code(db: Session, code: str):
    return db.query(models.Warehouse).filter(models.Warehouse.code == code).first()


def get_warehouse_by_id(db: Session, warehouse_id: str):
    return (
        db.query(models.Warehouse).filter(models.Warehouse.id == warehouse_id).first()
    )


def create_warehouse(db: Session, warehouse: schemas.WarehouseCreate):
    db_wh = models.Warehouse(
        id=str(uuid.uuid4()),
        code=warehouse.code,
        name=warehouse.name,
        location=warehouse.location,
    )
    db.add(db_wh)
    db.commit()
    db.refresh(db_wh)
    return db_wh


def get_warehouses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Warehouse).offset(skip).limit(limit).all()


# Item CRUD
def get_item_by_sku(db: Session, sku: str):
    return db.query(models.Item).filter(models.Item.sku == sku).first()


def get_item_by_id(db: Session, item_id: str):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(
        id=str(uuid.uuid4()),
        category_id=item.category_id,
        sku=item.sku,
        name=item.name,
        unit_price=item.unit_price,
        reorder_threshold=item.reorder_threshold,
        reorder_quantity=item.reorder_quantity,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_items(
    db: Session, skip: int = 0, limit: int = 20
) -> Tuple[int, List[models.Item]]:
    total = db.query(models.Item).count()
    items = db.query(models.Item).offset(skip).limit(limit).all()
    return total, items


def update_item(db: Session, item_id: str, item_update: schemas.ItemUpdate):
    db_item = get_item_by_id(db, item_id)
    if not db_item:
        return None
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


# Inventory CRUD
def get_inventory_levels(
    db: Session,
    warehouse_id: Optional[str] = None,
    sku: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[int, List[dict]]:
    query = (
        db.query(models.StockLevel, models.Item, models.Warehouse)
        .join(models.Item, models.StockLevel.item_id == models.Item.id)
        .join(models.Warehouse, models.StockLevel.warehouse_id == models.Warehouse.id)
    )

    if warehouse_id:
        query = query.filter(models.StockLevel.warehouse_id == warehouse_id)
    if sku:
        query = query.filter(models.Item.sku.ilike(f"%{sku}%"))

    total = query.count()
    results = query.offset(skip).limit(limit).all()

    items = []
    for stock, item, wh in results:
        items.append(
            {
                "item_id": item.id,
                "sku": item.sku,
                "warehouse_id": wh.id,
                "warehouse_name": wh.name,
                "quantity_on_hand": stock.quantity_on_hand,
                "reorder_threshold": item.reorder_threshold,
                "is_low_stock": stock.quantity_on_hand <= item.reorder_threshold,
                "updated_at": stock.updated_at,
            }
        )

    return total, items


# Stock Adjustment CRUD & Alert Evaluation
def create_stock_adjustment(
    db: Session, adj: schemas.StockAdjustmentCreate
) -> schemas.StockAdjustmentResponse:
    # 1. Fetch Item & Warehouse
    item = get_item_by_id(db, adj.item_id)
    if not item:
        raise ValueError(f"Item with ID {adj.item_id} not found")

    wh = get_warehouse_by_id(db, adj.warehouse_id)
    if not wh:
        raise ValueError(f"Warehouse with ID {adj.warehouse_id} not found")

    # 2. Get or create StockLevel
    stock = (
        db.query(models.StockLevel)
        .filter_by(item_id=adj.item_id, warehouse_id=adj.warehouse_id)
        .first()
    )

    if not stock:
        stock = models.StockLevel(
            id=str(uuid.uuid4()),
            item_id=adj.item_id,
            warehouse_id=adj.warehouse_id,
            quantity_on_hand=0,
        )
        db.add(stock)

    prev_qty = stock.quantity_on_hand
    new_qty = prev_qty + adj.quantity_change
    if new_qty < 0:
        raise ValueError(
            f"Stock quantity cannot be negative. Current: {prev_qty}, Change: {adj.quantity_change}"
        )

    stock.quantity_on_hand = new_qty

    # 3. Create StockAdjustment record
    user_id = adj.user_id if adj.user_id else str(uuid.uuid4())
    adjustment = models.StockAdjustment(
        id=str(uuid.uuid4()),
        item_id=adj.item_id,
        warehouse_id=adj.warehouse_id,
        user_id=user_id,
        quantity_change=adj.quantity_change,
        previous_quantity=prev_qty,
        new_quantity=new_qty,
        reason_code=adj.reason_code,
        notes=adj.notes,
    )
    db.add(adjustment)

    # 4. Check low stock threshold & trigger alert if needed
    alert_triggered = False
    if new_qty <= item.reorder_threshold:
        alert_triggered = True
        existing_alert = (
            db.query(models.StockAlert)
            .filter_by(
                item_id=adj.item_id, warehouse_id=adj.warehouse_id, status="ACTIVE"
            )
            .first()
        )

        if existing_alert:
            existing_alert.current_quantity = new_qty
            existing_alert.reorder_threshold = item.reorder_threshold
        else:
            new_alert = models.StockAlert(
                id=str(uuid.uuid4()),
                item_id=adj.item_id,
                warehouse_id=adj.warehouse_id,
                current_quantity=new_qty,
                reorder_threshold=item.reorder_threshold,
                status="ACTIVE",
            )
            db.add(new_alert)
    else:
        existing_alerts = (
            db.query(models.StockAlert)
            .filter_by(
                item_id=adj.item_id, warehouse_id=adj.warehouse_id, status="ACTIVE"
            )
            .all()
        )
        for al in existing_alerts:
            al.status = "RESOLVED"

    db.commit()
    db.refresh(adjustment)

    return schemas.StockAdjustmentResponse(
        adjustment_id=adjustment.id,
        item_id=adjustment.item_id,
        warehouse_id=adjustment.warehouse_id,
        previous_quantity=adjustment.previous_quantity,
        new_quantity=adjustment.new_quantity,
        quantity_change=adjustment.quantity_change,
        reason_code=adjustment.reason_code,
        notes=adjustment.notes,
        alert_triggered=alert_triggered,
        timestamp=adjustment.created_at,
    )


def transfer_stock(
    db: Session, transfer: schemas.StockTransferCreate
) -> schemas.StockTransferResponse:
    if transfer.from_warehouse_id == transfer.to_warehouse_id:
        raise ValueError("Source and destination warehouses must be different")

    user_id = transfer.user_id if transfer.user_id else str(uuid.uuid4())

    # Outbound adjustment from source warehouse
    outbound_adj = create_stock_adjustment(
        db,
        schemas.StockAdjustmentCreate(
            item_id=transfer.item_id,
            warehouse_id=transfer.from_warehouse_id,
            quantity_change=-transfer.quantity,
            reason_code="WAREHOUSE_TRANSFER_OUT",
            notes=f"Stock transfer to warehouse {transfer.to_warehouse_id}. {transfer.notes or ''}",
            user_id=user_id,
        ),
    )

    # Inbound adjustment to target warehouse
    inbound_adj = create_stock_adjustment(
        db,
        schemas.StockAdjustmentCreate(
            item_id=transfer.item_id,
            warehouse_id=transfer.to_warehouse_id,
            quantity_change=transfer.quantity,
            reason_code="WAREHOUSE_TRANSFER_IN",
            notes=f"Stock transfer from warehouse {transfer.from_warehouse_id}. {transfer.notes or ''}",
            user_id=user_id,
        ),
    )

    transfer_id = str(uuid.uuid4())
    return schemas.StockTransferResponse(
        transfer_id=transfer_id,
        item_id=transfer.item_id,
        from_warehouse_id=transfer.from_warehouse_id,
        to_warehouse_id=transfer.to_warehouse_id,
        quantity=transfer.quantity,
        outbound_adjustment_id=outbound_adj.adjustment_id,
        inbound_adjustment_id=inbound_adj.adjustment_id,
        timestamp=outbound_adj.timestamp,
    )


def get_stock_adjustments(
    db: Session, skip: int = 0, limit: int = 50
) -> Tuple[int, List[schemas.StockAdjustmentResponse]]:
    total = db.query(models.StockAdjustment).count()
    records = (
        db.query(models.StockAdjustment)
        .order_by(models.StockAdjustment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for r in records:
        alert_triggered = r.new_quantity <= (r.item.reorder_threshold if r.item else 10)
        result.append(
            schemas.StockAdjustmentResponse(
                adjustment_id=r.id,
                item_id=r.item_id,
                warehouse_id=r.warehouse_id,
                previous_quantity=r.previous_quantity,
                new_quantity=r.new_quantity,
                quantity_change=r.quantity_change,
                reason_code=r.reason_code,
                notes=r.notes,
                alert_triggered=alert_triggered,
                timestamp=r.created_at,
            )
        )
    return total, result


# Alerts CRUD
def get_alerts(
    db: Session, status: Optional[str] = None
) -> List[schemas.StockAlertResponse]:
    query = db.query(models.StockAlert, models.Item).join(
        models.Item, models.StockAlert.item_id == models.Item.id
    )

    if status:
        query = query.filter(models.StockAlert.status == status)

    records = query.all()
    result = []
    for alert, item in records:
        result.append(
            schemas.StockAlertResponse(
                id=alert.id,
                item_id=alert.item_id,
                sku=item.sku,
                warehouse_id=alert.warehouse_id,
                current_quantity=alert.current_quantity,
                reorder_threshold=alert.reorder_threshold,
                status=alert.status,
                created_at=alert.created_at,
            )
        )
    return result


def update_alert_status(
    db: Session, alert_id: str, new_status: str
) -> Optional[models.StockAlert]:
    alert = db.query(models.StockAlert).filter(models.StockAlert.id == alert_id).first()
    if not alert:
        return None
    alert.status = new_status
    db.commit()
    db.refresh(alert)
    return alert
