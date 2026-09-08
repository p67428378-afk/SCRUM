import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Cart, CartItem, Book, User
from server.schemas import (
    CartResponse,
    CartItemResponse,
    CartItemCreate,
    CartItemUpdate,
    BookResponse,
)
from server.auth import get_current_active_user

router = APIRouter()


def calculate_cart_summary(cart: Cart) -> dict:
    items_response = []
    subtotal = 0.0
    item_count = 0

    for item in cart.items:
        book_price = item.book.price if item.book else 0.0
        line_total = round(book_price * item.quantity, 2)
        subtotal += line_total
        item_count += item.quantity

        book_resp = BookResponse.model_validate(item.book) if item.book else None
        items_response.append(
            CartItemResponse(
                id=item.id,
                cart_id=item.cart_id,
                book_id=item.book_id,
                book=book_resp,
                quantity=item.quantity,
                item_total=line_total,
                created_at=item.created_at,
            )
        )

    subtotal = round(subtotal, 2)
    # Tax: 8% of subtotal
    tax = round(subtotal * 0.08, 2) if subtotal > 0 else 0.0
    # Shipping: $5.00 flat, free if subtotal >= 50 or empty
    shipping = 0.0 if (subtotal >= 50.0 or subtotal == 0.0) else 5.00
    total = round(subtotal + tax + shipping, 2)

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": items_response,
        "item_count": item_count,
        "subtotal": subtotal,
        "estimated_tax": tax,
        "estimated_shipping": shipping,
        "total_amount": total,
    }


def get_or_create_user_cart(user_id: str, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(
            id=str(uuid.uuid4()),
            user_id=user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    cart = get_or_create_user_cart(current_user.id, db)
    summary = calculate_cart_summary(cart)
    return CartResponse(**summary)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_200_OK)
def add_or_update_cart_item(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == item_in.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    if book.stock_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book '{book.title}' is out of stock",
        )

    cart = get_or_create_user_cart(current_user.id, db)
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.book_id == item_in.book_id)
        .first()
    )

    now = datetime.now(timezone.utc)
    if cart_item:
        new_quantity = cart_item.quantity + item_in.quantity
        if new_quantity > book.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add {item_in.quantity} more. Stock limit of {book.stock_quantity} reached.",
            )
        cart_item.quantity = new_quantity
        cart_item.updated_at = now
    else:
        if item_in.quantity > book.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({book.stock_quantity}).",
            )
        cart_item = CartItem(
            id=str(uuid.uuid4()),
            cart_id=cart.id,
            book_id=item_in.book_id,
            quantity=item_in.quantity,
            created_at=now,
            updated_at=now,
        )
        db.add(cart_item)

    cart.updated_at = now
    db.commit()
    db.refresh(cart)
    summary = calculate_cart_summary(cart)
    return CartResponse(**summary)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: str,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_user_cart(current_user.id, db)
    # item_id could be cart_item_id or book_id
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            (CartItem.id == item_id) | (CartItem.book_id == item_id),
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )

    book = cart_item.book
    if item_in.quantity > book.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({book.stock_quantity}).",
        )

    cart_item.quantity = item_in.quantity
    cart_item.updated_at = datetime.now(timezone.utc)
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cart)
    summary = calculate_cart_summary(cart)
    return CartResponse(**summary)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(
    item_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    cart = get_or_create_user_cart(current_user.id, db)
    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            (CartItem.id == item_id) | (CartItem.book_id == item_id),
        )
        .first()
    )

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )

    db.delete(cart_item)
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cart)
    summary = calculate_cart_summary(cart)
    return CartResponse(**summary)


@router.delete("", response_model=CartResponse)
def clear_cart(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    cart = get_or_create_user_cart(current_user.id, db)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    cart.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cart)
    summary = calculate_cart_summary(cart)
    return CartResponse(**summary)
