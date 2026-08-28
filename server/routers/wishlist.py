from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.dependencies.auth import get_current_user
from server.models.models import User, Product, WishlistItem
from server.schemas.schemas import (
    WishlistItemAddRequest,
    WishlistItemResponse,
    MoveToCartResponse,
)

router = APIRouter(prefix="/api/v1/wishlist", tags=["wishlist"])


@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).all()


@router.post(
    "", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED
)
def add_to_wishlist(
    item_data: WishlistItemAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == item_data.product_id,
        )
        .first()
    )
    if existing:
        return existing

    wishlist_item = WishlistItem(
        user_id=current_user.id, product_id=item_data.product_id
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist"
        )

    db.delete(item)
    db.commit()
    return {"message": "Item removed from wishlist", "product_id": product_id}


@router.post("/{product_id}/move-to-cart", response_model=MoveToCartResponse)
def move_to_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    if not product.in_stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Product is out of stock"
        )

    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if item:
        db.delete(item)
        db.commit()

    return MoveToCartResponse(
        product_id=product_id, message="Moved product from wishlist to cart"
    )
