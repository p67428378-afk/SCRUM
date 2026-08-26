import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import models, schemas
from server.database import get_db
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/wishlist", tags=["wishlist"])


@router.get("", response_model=List[schemas.WishlistItemResponse])
def get_wishlist(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(models.WishlistItem)
        .filter(models.WishlistItem.user_id == current_user.id)
        .order_by(models.WishlistItem.created_at.desc())
        .all()
    )
    return items


@router.post(
    "/{product_id}",
    response_model=schemas.WishlistItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_to_wishlist(
    product_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found",
        )

    existing = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == current_user.id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )
    if existing:
        return existing

    item = models.WishlistItem(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        product_id=product_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == current_user.id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in wishlist",
        )
    db.delete(item)
    db.commit()
    return None
