import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.models import CartItem, Order, OrderItem, ProductVariant, User
from server.schemas.schemas import CheckoutRequest, OrderListResponse, OrderResponse
from server.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout(
    checkout_in: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot process checkout with an empty cart"
        )

    # Validate stock and calculate totals
    subtotal = 0.0
    items_to_create = []

    for item in cart_items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        if not variant or variant.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{variant.sku if variant else item.variant_id}' is out of stock or has insufficient quantity"
            )

        unit_price = variant.product.price
        subtotal += unit_price * item.quantity

        items_to_create.append({
            "variant": variant,
            "unit_price": unit_price,
            "quantity": item.quantity
        })

    subtotal = round(subtotal, 2)
    shipping_fee = 5.00 if (0.0 < subtotal < 50.00) else 0.00
    tax_amount = round(subtotal * 0.08, 2)
    total_amount = round(subtotal + shipping_fee + tax_amount, 2)

    # Create Order
    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        user_id=current_user.id,
        status="Pending",
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        tax_amount=tax_amount,
        total_amount=total_amount,
        shipping_address=checkout_in.shipping_address,
        payment_method=checkout_in.payment_method
    )
    db.add(order)

    # Create OrderItems and decrement stock
    for item_data in items_to_create:
        variant = item_data["variant"]
        variant.stock_quantity -= item_data["quantity"]

        order_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order_id,
            variant_id=variant.id,
            unit_price=item_data["unit_price"],
            quantity=item_data["quantity"]
        )
        db.add(order_item)

    # Clear user's cart
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=OrderListResponse)
def get_user_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.user_id == current_user.id)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "orders": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order
