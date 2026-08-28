from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.dependencies.auth import get_current_user
from server.models.models import User, Product, ProductReview
from server.schemas.schemas import (
    ReviewCreate,
    ReviewResponse,
    ReviewItemResponse,
    ProductReviewsListResponse,
)
from server.routers.rewards import add_loyalty_points

router = APIRouter(prefix="/api/v1", tags=["reviews"])


@router.post(
    "/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED
)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == review_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    new_review = ProductReview(
        user_id=str(current_user.id),
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment,
    )
    db.add(new_review)
    db.flush()

    new_total_points = add_loyalty_points(
        user_id=str(current_user.id),
        points=50,
        reason=f"Loyalty bonus for reviewing product '{product.name}'",
        db=db,
    )

    db.commit()
    db.refresh(new_review)

    user_name = current_user.full_name or current_user.email
    comment_val: Optional[str] = (
        str(new_review.comment) if new_review.comment is not None else None
    )
    created_at_val: datetime = new_review.created_at  # type: ignore

    return ReviewResponse(
        id=str(new_review.id),
        user_id=str(new_review.user_id),
        user_name=str(user_name),
        product_id=str(new_review.product_id),
        rating=int(str(new_review.rating)),
        comment=comment_val,
        created_at=created_at_val,
        points_awarded=50,
        new_total_points=new_total_points,
    )


@router.get("/products/{product_id}/reviews", response_model=ProductReviewsListResponse)
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    reviews = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .all()
    )

    total_reviews = len(reviews)
    if total_reviews > 0:
        sum_ratings = sum(int(str(r.rating)) for r in reviews)
        average_rating = round(sum_ratings / total_reviews, 1)
    else:
        average_rating = 0.0

    review_items = []
    for r in reviews:
        author_name = (
            r.user.full_name
            if r.user and r.user.full_name
            else (r.user.email if r.user else "Anonymous")
        )
        item_comment: Optional[str] = str(r.comment) if r.comment is not None else None
        item_created_at: datetime = r.created_at  # type: ignore

        review_items.append(
            ReviewItemResponse(
                id=str(r.id),
                user_id=str(r.user_id),
                user_name=str(author_name),
                product_id=str(r.product_id),
                rating=int(str(r.rating)),
                comment=item_comment,
                created_at=item_created_at,
            )
        )

    return ProductReviewsListResponse(
        product_id=product_id,
        average_rating=average_rating,
        total_reviews=total_reviews,
        reviews=review_items,
    )
