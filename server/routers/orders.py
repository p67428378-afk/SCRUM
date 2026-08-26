import uuid
import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db
from server.auth import get_current_user, get_current_user_optional
from server.routers.cart import VALID_COUPONS

router = APIRouter(prefix="/api/v1", tags=["orders & checkout"])


def generate_tracking_id() -> str:
    random_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TRK-FURN-{random_code}"


@router.post("/checkout/estimate", response_model=schemas.CheckoutEstimateResponse)
def estimate_checkout(
    estimate_in: schemas.CheckoutEstimateRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    subtotal = estimate_in.subtotal

    if subtotal is None:
        cart = None
        if current_user:
            cart = (
                db.query(models.Cart)
                .filter(models.Cart.user_id == current_user.id)
                .first()
            )
        elif x_session_id:
            cart = (
                db.query(models.Cart)
                .filter(models.Cart.session_id == x_session_id)
                .first()
            )

        if cart and cart.items:
            subtotal = sum(item.unit_price * item.quantity for item in cart.items)
        else:
            subtotal = 0.0

    coupon = (estimate_in.coupon_code or "").strip().upper()
    discount_percent = VALID_COUPONS.get(coupon, 0.0)
    discount_amount = round(subtotal * (discount_percent / 100.0), 2)
    discounted_subtotal = max(0.0, subtotal - discount_amount)

    if subtotal > 0:
        tax_amount = round(discounted_subtotal * 0.08, 2)
        shipping_method = estimate_in.shipping_method or "standard"
        if shipping_method == "express":
            shipping_amount = 95.0
        else:
            shipping_amount = 0.0 if discounted_subtotal >= 1000.0 else 50.0
    else:
        tax_amount = 0.0
        shipping_amount = 0.0
        shipping_method = "standard"

    total_amount = round(discounted_subtotal + tax_amount + shipping_amount, 2)

    return schemas.CheckoutEstimateResponse(
        subtotal=round(subtotal, 2),
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        coupon_applied=coupon if discount_percent > 0 else None,
        shipping_method=estimate_in.shipping_method or "standard",
    )


@router.post(
    "/orders", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED
)
def create_order(
    order_in: schemas.OrderCreateRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    cart = None
    if current_user:
        cart = (
            db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
        )
    if not cart and x_session_id:
        cart = (
            db.query(models.Cart).filter(models.Cart.session_id == x_session_id).first()
        )

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order with an empty shopping cart",
        )

    # Check stock for each item and calculate amounts
    subtotal = 0.0
    order_items_to_create = []

    for item in cart.items:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} is no longer available",
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock_quantity}, requested: {item.quantity}",
            )

        # Decrement stock
        product.stock_quantity -= item.quantity
        item_total = item.unit_price * item.quantity
        subtotal += item_total

        order_items_to_create.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "quantity": item.quantity,
                "selected_finish": item.selected_finish,
                "selected_dimension": item.selected_dimension,
                "unit_price": item.unit_price,
                "total_price": item_total,
            }
        )

    # Apply discounts
    coupon_code = order_in.coupon_code or cart.coupon_code
    discount_percent = 0.0
    if coupon_code:
        clean_code = coupon_code.strip().upper()
        discount_percent = VALID_COUPONS.get(clean_code, 0.0)

    discount_amount = round(subtotal * (discount_percent / 100.0), 2)
    discounted_subtotal = max(0.0, subtotal - discount_amount)
    tax_amount = round(discounted_subtotal * 0.08, 2)
    shipping_amount = 0.0 if discounted_subtotal >= 1000.0 else 50.0
    total_amount = round(discounted_subtotal + tax_amount + shipping_amount, 2)

    order_id = str(uuid.uuid4())
    new_order = models.Order(
        id=order_id,
        user_id=current_user.id if current_user else None,
        subtotal=round(subtotal, 2),
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        status="Processing",
        shipping_address=order_in.shipping_address.model_dump(),
        payment_method=order_in.payment_method,
        tracking_id=generate_tracking_id(),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_order)

    for item_data in order_items_to_create:
        order_item = models.OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity=item_data["quantity"],
            selected_finish=item_data["selected_finish"],
            selected_dimension=item_data["selected_dimension"],
            unit_price=item_data["unit_price"],
            total_price=item_data["total_price"],
            created_at=datetime.now(timezone.utc),
        )
        db.add(order_item)

    # Clear cart items and reset coupon
    for item in list(cart.items):
        db.delete(item)
    cart.coupon_code = None
    cart.discount_percent = 0.0

    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/orders", response_model=List[schemas.OrderResponse])
def list_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    query = db.query(models.Order).filter(models.Order.id == order_id)
    if current_user and current_user.role != "admin":
        query = query.filter(
            (models.Order.user_id == current_user.id) | (models.Order.user_id.is_(None))
        )
    order = query.first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found",
        )
    return order
