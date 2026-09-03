import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from server.database import get_db, seed_data
from server.models import MenuItem, Order, OrderItem, Table
from server.schemas import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

TAX_RATE = 0.08  # 8% tax rate


def generate_order_number(db: Session) -> str:
    count = db.query(Order).count()
    return f"ORD-{101 + count}"


def find_table(table_identifier: str, db: Session) -> Optional[Table]:
    table = db.query(Table).filter(Table.id == table_identifier).first()
    if not table and table_identifier.isdigit():
        table = (
            db.query(Table).filter(Table.table_number == int(table_identifier)).first()
        )
    return table


@router.get("", response_model=List[OrderResponse])
def get_orders(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (Pending, Preparing, Ready, Completed, Cancelled)",
    ),
    table_id: Optional[str] = Query(None, description="Filter by table ID"),
    db: Session = Depends(get_db),
):
    seed_data(db)
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.menu_item)
    )
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Order.status.ilike(status_filter))
    if table_id and table_id.lower() != "all":
        table = find_table(table_id, db)
        target_id = table.id if table else table_id
        query = query.filter(Order.table_id == target_id)
    return query.order_by(Order.created_at.desc()).all()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    seed_data(db)
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item.",
        )

    resolved_table_id = None
    if order_in.table_id:
        table = find_table(order_in.table_id, db)
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table '{order_in.table_id}' not found.",
            )
        resolved_table_id = table.id

    subtotal = 0.0
    order_items_to_create = []

    for item_req in order_in.items:
        menu_item = (
            db.query(MenuItem).filter(MenuItem.id == item_req.menu_item_id).first()
        )
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id '{item_req.menu_item_id}' not found.",
            )
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item.name}' is out of stock / unavailable.",
            )

        item_subtotal = round(menu_item.price * item_req.quantity, 2)
        subtotal += item_subtotal
        order_items_to_create.append(
            {
                "menu_item_id": menu_item.id,
                "quantity": item_req.quantity,
                "unit_price": menu_item.price,
                "subtotal": item_subtotal,
            }
        )

    subtotal = round(subtotal, 2)
    tax = round(subtotal * TAX_RATE, 2)
    total_price = round(subtotal + tax, 2)

    order_id = str(uuid.uuid4())
    order_number = generate_order_number(db)

    db_order = Order(
        id=order_id,
        order_number=order_number,
        table_id=resolved_table_id,
        subtotal=subtotal,
        tax=tax,
        total_price=total_price,
        status="Pending",
    )
    db.add(db_order)
    db.flush()

    for item_data in order_items_to_create:
        db_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            menu_item_id=item_data["menu_item_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(db_item)

    if resolved_table_id:
        table = db.query(Table).filter(Table.id == resolved_table_id).first()
        if table and table.status == "Available":
            table.status = "Occupied"  # type: ignore[assignment]

    db.commit()

    # Re-query with relationships loaded
    full_order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter(Order.id == order_id)
        .first()
    )
    return full_order


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    seed_data(db)
    db_order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter(Order.id == order_id)
        .first()
    )
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id '{order_id}' not found.",
        )
    return db_order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str, status_in: OrderStatusUpdate, db: Session = Depends(get_db)
):
    seed_data(db)
    db_order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter(Order.id == order_id)
        .first()
    )
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id '{order_id}' not found.",
        )

    valid_statuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"]
    matched_status = next(
        (s for s in valid_statuses if s.lower() == status_in.status.lower()), None
    )
    if not matched_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_in.status}'. Valid statuses: {valid_statuses}",
        )

    db_order.status = matched_status  # type: ignore[assignment]

    # Update associated table status if completed or cancelled
    if matched_status in ["Completed", "Cancelled"] and db_order.table_id:
        table = db.query(Table).filter(Table.id == db_order.table_id).first()
        if table and table.status == "Occupied":
            table.status = "Available"  # type: ignore[assignment]

    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id '{order_id}' not found.",
        )
    db.delete(db_order)
    db.commit()
    return None
