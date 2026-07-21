from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal

from server.database import get_db
from server.models.restaurant import Restaurant, MenuItem
from server.models.booking import Booking
from server.models.order import Order, OrderItem
from server.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderDetailedResponse,
    OrderStatusUpdate,
)
from server.routers.auth import get_current_user

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # Check if restaurant exists
    restaurant = (
        db.query(Restaurant).filter(Restaurant.id == order_in.restaurant_id).first()
    )
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant not found",
        )

    # Check if booking exists if provided
    if order_in.booking_id:
        booking = db.query(Booking).filter(Booking.id == order_in.booking_id).first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found",
            )

    # Calculate total price and prepare order items
    total_price = Decimal("0.00")
    order_items = []

    for item_in in order_in.items:
        menu_item = (
            db.query(MenuItem)
            .filter(
                MenuItem.id == item_in.menu_item_id,
                MenuItem.restaurant_id == order_in.restaurant_id,
            )
            .first()
        )
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item_in.menu_item_id} not found in this restaurant",
            )

        if item_in.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero",
            )

        item_price = menu_item.price
        item_total = item_price * item_in.quantity
        total_price += item_total

        order_item = OrderItem(
            menu_item_id=item_in.menu_item_id,
            quantity=item_in.quantity,
            price=item_price,
        )
        order_items.append(order_item)

    # Create order
    order = Order(
        booking_id=order_in.booking_id,
        restaurant_id=order_in.restaurant_id,
        total_price=total_price,
        status="Placed",
        notes=order_in.notes,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderDetailedResponse])
def get_orders(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderDetailedResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    valid_statuses = [
        "Placed",
        "In the Kitchen",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
    ]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status value. Must be one of {valid_statuses}",
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
