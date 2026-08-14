import uuid
import random
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from server.database import get_db
from server.models import Order, OrderItem, MenuItem, Address, User
from server.schemas import (
    OrderCreateRequest,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
    StaffDashboardResponse,
)
from server.auth import get_current_user, get_current_staff_or_admin

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


def generate_order_number() -> str:
    num = random.randint(1000, 9999)
    return f"#BD-{num}"


def format_order_response(order: Order) -> OrderResponse:
    item_responses = []
    for item in order.items:
        menu_item_name = item.menu_item.name if item.menu_item else "Unknown Item"
        item_responses.append(
            OrderItemResponse(
                id=item.id,
                menu_item_id=item.menu_item_id,
                menu_item_name=menu_item_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                item_total=item.item_total,
            )
        )

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        order_number=order.order_number,
        status=order.status,
        total_amount=order.total_amount,
        delivery_fee=order.delivery_fee,
        delivery_address_text=order.delivery_address_text,
        special_instructions=order.special_instructions,
        payment_method=order.payment_method or "Credit/Debit Card",
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=item_responses,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_data: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # Determine delivery address text
    address_text = order_data.delivery_address_text
    if not address_text and order_data.address_id:
        addr = (
            db.query(Address)
            .filter(
                Address.id == order_data.address_id, Address.user_id == current_user.id
            )
            .first()
        )
        if addr:
            address_text = f"{addr.street_address}, {addr.city}, {addr.postal_code}"

    if not address_text:
        # Check default address
        default_addr = (
            db.query(Address)
            .filter(Address.user_id == current_user.id, Address.is_default == True)
            .first()
        )
        if default_addr:
            address_text = f"{default_addr.street_address}, {default_addr.city}, {default_addr.postal_code}"

    if not address_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delivery address is required",
        )

    # Calculate item totals
    order_items_to_create = []
    items_subtotal = 0.0

    for item_req in order_data.items:
        menu_item = (
            db.query(MenuItem).filter(MenuItem.id == item_req.menu_item_id).first()
        )
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item ID {item_req.menu_item_id} not found",
            )
        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item.name}' is currently unavailable",
            )

        unit_price = menu_item.price
        item_total = round(unit_price * item_req.quantity, 2)
        items_subtotal += item_total

        order_items_to_create.append(
            {
                "menu_item_id": menu_item.id,
                "quantity": item_req.quantity,
                "unit_price": unit_price,
                "item_total": item_total,
            }
        )

    delivery_fee = 3.00
    grand_total = round(items_subtotal + delivery_fee, 2)

    # Generate unique order number
    order_number = generate_order_number()
    while db.query(Order).filter(Order.order_number == order_number).first():
        order_number = generate_order_number()

    payment_method = order_data.payment_method or "Credit/Debit Card"

    new_order = Order(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        order_number=order_number,
        status="Placed",
        total_amount=grand_total,
        delivery_fee=delivery_fee,
        delivery_address_text=address_text,
        special_instructions=order_data.special_instructions,
        payment_method=payment_method,
    )
    db.add(new_order)
    db.flush()

    for item_dict in order_items_to_create:
        oi = OrderItem(
            id=str(uuid.uuid4()),
            order_id=new_order.id,
            menu_item_id=item_dict["menu_item_id"],
            quantity=item_dict["quantity"],
            unit_price=item_dict["unit_price"],
            item_total=item_dict["item_total"],
        )
        db.add(oi)

    db.commit()

    # Re-query with eager load
    created_order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter(Order.id == new_order.id)
        .first()
    )

    return format_order_response(created_order)


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [format_order_response(o) for o in orders]


@router.get("/staff/dashboard", response_model=StaffDashboardResponse)
def get_staff_dashboard(
    current_staff: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .order_by(Order.created_at.desc())
        .all()
    )

    status_counts: Dict[str, int] = {
        "Placed": 0,
        "Confirmed": 0,
        "Preparing": 0,
        "Out for Delivery": 0,
        "Delivered": 0,
        "Cancelled": 0,
    }

    formatted_orders = []
    for o in orders:
        status_counts[o.status] = status_counts.get(o.status, 0) + 1
        formatted_orders.append(format_order_response(o))

    menu_items = db.query(MenuItem).order_by(MenuItem.name.asc()).all()

    return StaffDashboardResponse(
        orders=formatted_orders,
        status_counts=status_counts,
        menu_availability_items=menu_items,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter((Order.id == order_id) | (Order.order_number == order_id))
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Check permission: user is owner or staff/admin
    if (
        current_user.role.upper() not in ["STAFF", "ADMIN"]
        and order.user_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Not your order",
        )

    return format_order_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_staff: User = Depends(get_current_staff_or_admin),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.menu_item))
        .filter((Order.id == order_id) | (Order.order_number == order_id))
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    valid_statuses = [
        "Placed",
        "Confirmed",
        "Preparing",
        "Ready for Pickup",
        "Dispatched",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
    ]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Allowed values: {valid_statuses}",
        )

    order.status = status_update.status
    db.commit()
    db.refresh(order)

    return format_order_response(order)
