import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.models import WishlistItem, Product, CartItem, User
from server.schemas.schemas import (
    WishlistCreateRequest,
    WishlistActionResponse,
    WishlistItemResponse,
)
from server.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/wishlist", tags=["Wishlist"])


def _format_wishlist_item(item: WishlistItem) -> dict:
    product = item.product
    in_stock = True
    if product and product.variants:
        in_stock = any(v.stock_quantity > 0 for v in product.variants)

    product_data = {
        "id": product.id if product else item.product_id,
        "name": product.title if product else "Unknown Product",
        "price": product.price if product else 0.0,
        "image_url": product.image_url if product else None,
        "in_stock": in_stock,
    }

    return {
        "id": item.id,
        "user_id": item.user_id,
        "product_id": item.product_id,
        "created_at": item.created_at,
        "product": product_data,
    }


@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    return [_format_wishlist_item(item) for item in items]


@router.post("", response_model=WishlistActionResponse, status_code=status.HTTP_200_OK)
def add_to_wishlist(
    item_in: WishlistCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if product exists
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Check for duplicate item (idempotent)
    existing_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == item_in.product_id,
        )
        .first()
    )

    if existing_item:
        return WishlistActionResponse(
            message="Product already in wishlist", product_id=item_in.product_id
        )

    new_item = WishlistItem(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_id=item_in.product_id,
    )
    db.add(new_item)
    db.commit()

    return WishlistActionResponse(
        message="Product added to wishlist", product_id=item_in.product_id
    )


@router.delete("/{product_id}", response_model=WishlistActionResponse)
def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    wishlist_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )

    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in wishlist",
        )

    db.delete(wishlist_item)
    db.commit()

    return WishlistActionResponse(
        message="Product removed from wishlist", product_id=product_id
    )


@router.post("/{product_id}/move-to-cart", response_model=WishlistActionResponse)
def move_wishlist_to_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find wishlist item
    wishlist_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )

    if not wishlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in wishlist",
        )

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product or not product.variants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No product variant available to add to cart",
        )

    # Pick variant with stock if available, else first variant
    variant = next(
        (v for v in product.variants if v.stock_quantity > 0), product.variants[0]
    )

    # Check existing cart item for this user & variant
    existing_cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.variant_id == variant.id,
        )
        .first()
    )

    if existing_cart_item:
        existing_cart_item.quantity += 1
    else:
        new_cart_item = CartItem(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            variant_id=variant.id,
            quantity=1,
        )
        db.add(new_cart_item)

    # Delete wishlist item in atomic transaction
    db.delete(wishlist_item)
    db.commit()

    return WishlistActionResponse(
        message="Product moved to cart successfully", product_id=product_id
    )
