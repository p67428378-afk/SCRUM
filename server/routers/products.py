import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.product import Category, Product
from server.schemas.search import (
    CategoryResponse,
    CategoryCreate,
    ProductResponse,
    ProductCreate,
)

router = APIRouter(tags=["Products & Categories"])


@router.get(
    "/categories",
    response_model=List[CategoryResponse],
    summary="List all categories",
)
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    slug = category_in.slug or category_in.name.lower().replace(" ", "-")
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category slug already exists",
        )

    category = Category(
        id=str(uuid.uuid4()),
        name=category_in.name,
        slug=slug,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get(
    "/products",
    response_model=List[ProductResponse],
    summary="List products",
)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)

    products = query.offset(skip).limit(limit).all()

    result = []
    for prod in products:
        category_name = prod.category.name if prod.category else None
        result.append(
            ProductResponse(
                id=prod.id,
                title=prod.title,
                description=prod.description,
                price=prod.price,
                thumbnail_url=prod.thumbnail_url,
                tags=prod.tags_list,
                category_id=prod.category_id,
                category_name=category_name,
            )
        )
    return result


@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    if product_in.category_id:
        category = (
            db.query(Category).filter(Category.id == product_in.category_id).first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Specified category not found",
            )

    product = Product(
        id=str(uuid.uuid4()),
        title=product_in.title,
        description=product_in.description,
        price=product_in.price,
        thumbnail_url=product_in.thumbnail_url,
        tags=",".join(product_in.tags) if product_in.tags else "",
        category_id=product_in.category_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    category_name = product.category.name if product.category else None
    return ProductResponse(
        id=product.id,
        title=product.title,
        description=product.description,
        price=product.price,
        thumbnail_url=product.thumbnail_url,
        tags=product.tags_list,
        category_id=product.category_id,
        category_name=category_name,
    )


@router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
    summary="Get product by ID",
)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    category_name = product.category.name if product.category else None
    return ProductResponse(
        id=product.id,
        title=product.title,
        description=product.description,
        price=product.price,
        thumbnail_url=product.thumbnail_url,
        tags=product.tags_list,
        category_id=product.category_id,
        category_name=category_name,
    )
