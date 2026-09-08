import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Cart, CartItem, Book, Order, OrderItem, User
from server.schemas import (
    CheckoutRequest,
    OrderResponse,
    OrderItemResponse,
    BookResponse,
)
from server.auth import get_current_active_user

router = APIRouter()


def build_order_response(order: Order) -> OrderResponse:
    order_items_resp = []
    for item in order.order_items:
        book_resp = BookResponse.model_validate(item.book) if item.book else None
        order_items_resp.append(
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                book_id=item.book_id,
                book=book_resp,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=round(item.unit_price * item.quantity, 2),
                created_at=item.created_at,
            )
        )

    shipping_addr = (
        order.shipping_address if isinstance(order.shipping_address, dict) else {}
    )

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        shipping_amount=order.shipping_amount,
        total_amount=order.total_amount,
        shipping_address=shipping_addr,
        created_at=order.created_at,
        updated_at=order.updated_at,
        order_items=order_items_resp,
    )


@router.post(
    "/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED
)
def checkout(
    checkout_in: CheckoutRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty. Add items to checkout.",
        )

    # Validate stock for all items
    subtotal = 0.0
    for item in cart.items:
        book = db.query(Book).filter(Book.id == item.book_id).first()
        if not book:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Book with ID {item.book_id} is no longer available",
            )
        if book.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{book.title}'. Available: {book.stock_quantity}, requested: {item.quantity}",
            )
        subtotal += round(book.price * item.quantity, 2)

    subtotal = round(subtotal, 2)
    tax_amount = round(subtotal * 0.08, 2)
    shipping_amount = 0.0 if subtotal >= 50.0 else 5.00
    total_amount = round(subtotal + tax_amount + shipping_amount, 2)

    # Extract shipping address dict
    if hasattr(checkout_in.shipping_address, "model_dump"):
        shipping_dict = checkout_in.shipping_address.model_dump()
    elif isinstance(checkout_in.shipping_address, dict):
        shipping_dict = checkout_in.shipping_address
    else:
        shipping_dict = {"raw": str(checkout_in.shipping_address)}

    now = datetime.now(timezone.utc)
    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        user_id=current_user.id,
        status="Processing",
        subtotal=subtotal,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        shipping_address=shipping_dict,
        created_at=now,
        updated_at=now,
    )
    db.add(order)
    db.flush()

    # Create OrderItems and decrement Book stock
    for item in cart.items:
        book = db.query(Book).filter(Book.id == item.book_id).first()
        book.stock_quantity -= item.quantity
        order_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order.id,
            book_id=item.book_id,
            quantity=item.quantity,
            unit_price=book.price,
            created_at=now,
        )
        db.add(order_item)

    # Clear cart items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    cart.updated_at = now

    db.commit()
    db.refresh(order)

    return build_order_response(order)


@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [build_order_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )

    return build_order_response(order)
