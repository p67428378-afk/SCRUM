import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import MenuItem, Order, OrderItem, Table
from server.schemas import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderUpdateStatus,
)

router = APIRouter()


def _generate_order_number(db: Session) -> str:
    while True:
        num = random.randint(100, 9999)
        order_num = f"ORD-{num}"
        existing = db.query(Order).filter(Order.order_number == order_num).first()
        if not existing:
            return order_num


def _build_order_response(order: Order) -> OrderResponse:
    items_resp = []
    for item in order.items:
        menu_item_name = item.menu_item.name if item.menu_item else "Unknown Item"
        items_resp.append(
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                menu_item_id=item.menu_item_id,
                menu_item_name=menu_item_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
        )

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        table_id=order.table_id,
        subtotal=order.subtotal,
        tax=order.tax,
        total_price=order.total_price,
        status=order.status,
        items=items_resp,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.get("", response_model=List[OrderResponse])
@router.get("/", response_model=List[OrderResponse])
def get_orders(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (Pending, Preparing, Ready, Completed, Cancelled)",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status.ilike(status_filter))
    orders = query.order_by(Order.created_at.desc()).all()
    return [_build_order_response(o) for o in orders]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    if order_in.table_id:
        table = db.query(Table).filter(Table.id == order_in.table_id).first()
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Table with ID {order_in.table_id} not found",
            )

    order_items_to_create = []
    calculated_subtotal = 0.0

    for item_in in order_in.items:
        menu_item = (
            db.query(MenuItem).filter(MenuItem.id == item_in.menu_item_id).first()
        )
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item with ID {item_in.menu_item_id} does not exist",
            )
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item.name}' is currently out of stock and cannot be ordered",
            )

        item_subtotal = round(menu_item.price * item_in.quantity, 2)
        calculated_subtotal += item_subtotal

        order_items_to_create.append(
            {
                "menu_item_id": menu_item.id,
                "quantity": item_in.quantity,
                "unit_price": menu_item.price,
                "subtotal": item_subtotal,
            }
        )

    calculated_subtotal = round(calculated_subtotal, 2)
    tax = round(calculated_subtotal * 0.08, 2)
    total_price = round(calculated_subtotal + tax, 2)

    order_number = _generate_order_number(db)

    order = Order(
        order_number=order_number,
        table_id=order_in.table_id,
        subtotal=calculated_subtotal,
        tax=tax,
        total_price=total_price,
        status="Pending",
    )
    db.add(order)
    db.flush()

    for oi in order_items_to_create:
        db_oi = OrderItem(
            order_id=order.id,
            menu_item_id=oi["menu_item_id"],
            quantity=oi["quantity"],
            unit_price=oi["unit_price"],
            subtotal=oi["subtotal"],
        )
        db.add(db_oi)

    if order_in.table_id:
        table = db.query(Table).filter(Table.id == order_in.table_id).first()
        if table and table.status == "Available":
            table.status = "Occupied"

    db.commit()
    db.refresh(order)
    return _build_order_response(order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return _build_order_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
@router.put("/{order_id}/status", response_model=OrderResponse)
@router.patch("/{order_id}", response_model=OrderResponse)
def update_order_status(
    order_id: str, status_in: OrderUpdateStatus, db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    valid_statuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"]
    if status_in.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_in.status}'. Allowed statuses: {', '.join(valid_statuses)}",
        )

    order.status = status_in.status

    # If order is completed or cancelled, free up the table if no active orders remain on that table
    if status_in.status in ["Completed", "Cancelled"] and order.table_id:
        active_orders = (
            db.query(Order)
            .filter(
                Order.table_id == order.table_id,
                Order.id != order.id,
                Order.status.in_(["Pending", "Preparing", "Ready"]),
            )
            .count()
        )
        if active_orders == 0:
            table = db.query(Table).filter(Table.id == order.table_id).first()
            if table:
                table.status = "Available"

    db.commit()
    db.refresh(order)
    return _build_order_response(order)
