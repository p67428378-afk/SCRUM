import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Response, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.models import CartItem, ProductVariant, User
from server.schemas.schemas import CartItemAdd, CartItemUpdate, CartResponse
from server.dependencies.auth import get_current_user_optional

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def _get_cart_filter(user: Optional[User], session_id: Optional[str]):
    if user:
        return CartItem.user_id == user.id
    elif session_id:
        return CartItem.session_id == session_id
    else:
        # Fallback empty condition
        return CartItem.id == "none"


def _build_cart_response(cart_items) -> dict:
    formatted_items = []
    subtotal = 0.0

    for item in cart_items:
        variant = item.variant
        product = variant.product
        item_total = round(product.price * item.quantity, 2)
        subtotal += item_total

        formatted_items.append({
            "id": item.id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "variant": variant,
            "product": product,
            "item_total": item_total
        })

    subtotal = round(subtotal, 2)
    shipping_estimate = 5.00 if (0.0 < subtotal < 50.00) else 0.00
    tax_estimate = round(subtotal * 0.08, 2)
    total = round(subtotal + shipping_estimate + tax_estimate, 2)

    return {
        "items": formatted_items,
        "subtotal": subtotal,
        "shipping_estimate": shipping_estimate,
        "tax_estimate": tax_estimate,
        "total": total
    }


@router.get("", response_model=CartResponse)
def get_cart(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    filter_cond = _get_cart_filter(current_user, x_session_id)
    cart_items = db.query(CartItem).filter(filter_cond).all()
    return _build_cart_response(cart_items)


@router.post("/items", response_model=CartResponse)
def add_to_cart(
    item_in: CartItemAdd,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user and not x_session_id:
        x_session_id = str(uuid.uuid4())

    variant = db.query(ProductVariant).filter(ProductVariant.id == item_in.variant_id).first()
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found"
        )

    filter_cond = _get_cart_filter(current_user, x_session_id)
    existing_item = db.query(CartItem).filter(filter_cond, CartItem.variant_id == item_in.variant_id).first()

    requested_qty = item_in.quantity
    if existing_item:
        requested_qty += existing_item.quantity

    if variant.stock_quantity < requested_qty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity exceeds available stock ({variant.stock_quantity})"
        )

    if existing_item:
        existing_item.quantity = requested_qty
    else:
        new_item = CartItem(
            id=str(uuid.uuid4()),
            user_id=current_user.id if current_user else None,
            session_id=x_session_id if not current_user else None,
            variant_id=item_in.variant_id,
            quantity=item_in.quantity
        )
        db.add(new_item)

    db.commit()

    cart_items = db.query(CartItem).filter(_get_cart_filter(current_user, x_session_id)).all()
    return _build_cart_response(cart_items)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: str,
    item_in: CartItemUpdate,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    filter_cond = _get_cart_filter(current_user, x_session_id)
    cart_item = db.query(CartItem).filter(filter_cond, CartItem.id == item_id).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    variant = cart_item.variant
    if variant.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity exceeds available stock ({variant.stock_quantity})"
        )

    cart_item.quantity = item_in.quantity
    db.commit()

    cart_items = db.query(CartItem).filter(_get_cart_filter(current_user, x_session_id)).all()
    return _build_cart_response(cart_items)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(
    item_id: str,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    filter_cond = _get_cart_filter(current_user, x_session_id)
    cart_item = db.query(CartItem).filter(filter_cond, CartItem.id == item_id).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
