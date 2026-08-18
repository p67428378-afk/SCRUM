from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models.models import Product, Category, ProductVariant
from server.schemas.schemas import ProductDetailResponse, ProductListResponse, ProductResponse

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="Category slug, name, or ID filter"),
    size: Optional[str] = Query(None, description="Size filter (e.g. S, M, L, XL)"),
    color: Optional[str] = Query(None, description="Color filter"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    q: Optional[str] = Query(None, description="Keyword search in title or description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        # Check if category matches slug, name, or id
        query = query.join(Product.category).filter(
            or_(
                Category.slug.ilike(category),
                Category.name.ilike(category),
                Category.id == category
            )
        )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Product.title.ilike(search_pattern),
                Product.description.ilike(search_pattern)
            )
        )

    if size or color:
        query = query.join(Product.variants)
        if size:
            query = query.filter(ProductVariant.size.ilike(size))
        if color:
            query = query.filter(ProductVariant.color.ilike(color))

    total = query.distinct().count()
    items = query.distinct().offset(skip).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product
