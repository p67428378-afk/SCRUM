import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db
from server.auth import get_current_user_optional

router = APIRouter(prefix="/api/v1/cart", tags=["cart"])

VALID_COUPONS = {
    "SAVE10": 10.0,
    "FURNITURE20": 20.0,
    "WELCOME15": 15.0,
    "LUXURY25": 25.0,
    "SPRING30": 30.0,
}


def get_or_create_cart(
    db: Session,
    current_user: Optional[models.User] = None,
    session_id: Optional[str] = None,
) -> models.Cart:
    cart = None
    if current_user:
        cart = (
            db.query(models.Cart).filter(models.Cart.user_id == current_user.id).first()
        )
    elif session_id:
        cart = (
            db.query(models.Cart).filter(models.Cart.session_id == session_id).first()
        )

    if not cart:
        cart = models.Cart(
            id=str(uuid.uuid4()),
            user_id=current_user.id if current_user else None,
            session_id=session_id if not current_user else None,
            coupon_code=None,
            discount_percent=0.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def calculate_cart_totals(cart: models.Cart) -> schemas.CartResponse:
    subtotal = 0.0
    items_response = []

    for item in cart.items:
        subtotal += item.unit_price * item.quantity
        items_response.append(schemas.CartItemResponse.model_validate(item))

    discount_percent = cart.discount_percent or 0.0
    discount_amount = round(subtotal * (discount_percent / 100.0), 2)
    discounted_subtotal = max(0.0, subtotal - discount_amount)

    if subtotal > 0:
        tax_amount = round(discounted_subtotal * 0.08, 2)
        # Free shipping over $1000
        shipping_amount = 0.0 if discounted_subtotal >= 1000.0 else 50.0
    else:
        tax_amount = 0.0
        shipping_amount = 0.0

    total_amount = round(discounted_subtotal + tax_amount + shipping_amount, 2)

    return schemas.CartResponse(
        id=cart.id,
        items=items_response,
        subtotal=round(subtotal, 2),
        coupon_code=cart.coupon_code,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
    )


@router.get("", response_model=schemas.CartResponse)
def get_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )
    return calculate_cart_totals(cart)


@router.post(
    "/items", response_model=schemas.CartResponse, status_code=status.HTTP_201_CREATED
)
def add_item_to_cart(
    item_in: schemas.CartItemCreate,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    product = (
        db.query(models.Product).filter(models.Product.id == item_in.product_id).first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {item_in.product_id} not found",
        )
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock_quantity} units available in stock",
        )

    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )

    # Check if item with matching finish and dimension is already in cart
    existing_item = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.cart_id == cart.id,
            models.CartItem.product_id == item_in.product_id,
            models.CartItem.selected_finish == item_in.selected_finish,
            models.CartItem.selected_dimension == item_in.selected_dimension,
        )
        .first()
    )

    if existing_item:
        new_qty = existing_item.quantity + item_in.quantity
        if product.stock_quantity < new_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add more units. Total requested ({new_qty}) exceeds stock ({product.stock_quantity})",
            )
        existing_item.quantity = new_qty
        existing_item.updated_at = datetime.now(timezone.utc)
    else:
        new_item = models.CartItem(
            id=str(uuid.uuid4()),
            cart_id=cart.id,
            product_id=product.id,
            quantity=item_in.quantity,
            selected_finish=item_in.selected_finish,
            selected_dimension=item_in.selected_dimension,
            unit_price=product.price,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return calculate_cart_totals(cart)


@router.put("/items/{item_id}", response_model=schemas.CartResponse)
def update_cart_item(
    item_id: str,
    item_update: schemas.CartItemUpdate,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    if item_update.quantity <= 0:
        db.delete(item)
    else:
        product = (
            db.query(models.Product)
            .filter(models.Product.id == item.product_id)
            .first()
        )
        if product and product.stock_quantity < item_update.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({item_update.quantity}) exceeds available stock ({product.stock_quantity})",
            )
        item.quantity = item_update.quantity
        if item_update.selected_finish is not None:
            item.selected_finish = item_update.selected_finish
        if item_update.selected_dimension is not None:
            item.selected_dimension = item_update.selected_dimension
        item.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(cart)
    return calculate_cart_totals(cart)


@router.delete("/items/{item_id}", response_model=schemas.CartResponse)
def remove_cart_item(
    item_id: str,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )
    item = (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.cart_id == cart.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    db.delete(item)
    db.commit()
    db.refresh(cart)
    return calculate_cart_totals(cart)


@router.delete("/clear", response_model=schemas.CartResponse)
def clear_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
    cart.coupon_code = None
    cart.discount_percent = 0.0
    db.commit()
    db.refresh(cart)
    return calculate_cart_totals(cart)


@router.post("/coupon", response_model=schemas.CouponApplyResponse)
def apply_coupon(
    coupon_in: schemas.CouponApplyRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    code = coupon_in.coupon_code.strip().upper()
    if code not in VALID_COUPONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid promo code '{coupon_in.coupon_code}'",
        )

    discount_percent = VALID_COUPONS[code]
    cart = get_or_create_cart(
        db,
        current_user=current_user,
        session_id=x_session_id or "default-guest-session",
    )
    cart.coupon_code = code
    cart.discount_percent = discount_percent
    db.commit()

    subtotal = sum(item.unit_price * item.quantity for item in cart.items)
    discount_amount = round(subtotal * (discount_percent / 100.0), 2)

    return schemas.CouponApplyResponse(
        valid=True,
        coupon_code=code,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        message=f"Coupon '{code}' applied successfully! {int(discount_percent)}% discount applied.",
    )
