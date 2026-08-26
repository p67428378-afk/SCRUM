import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server import models, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1", tags=["catalog"])


# --- Categories Endpoints ---
@router.get("/categories", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post(
    "/categories",
    response_model=schemas.CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(cat_in: schemas.CategoryCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.Category)
        .filter(models.Category.slug == cat_in.slug.lower())
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category slug already exists",
        )
    new_cat = models.Category(
        id=str(uuid.uuid4()),
        name=cat_in.name,
        slug=cat_in.slug.lower(),
        description=cat_in.description,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat


# --- Products Endpoints ---
@router.get("/products", response_model=schemas.ProductListResponse)
def list_products(
    category: Optional[str] = Query(None, description="Category slug, name, or UUID"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    material: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    rating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = Query(None, description="Search query string"),
    sort: Optional[str] = Query(
        None, description="Sort field: price_asc, price_desc, rating_desc, newest"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)

    # Filter by category
    if category:
        cat_obj = (
            db.query(models.Category)
            .filter(
                or_(
                    models.Category.slug == category.lower(),
                    models.Category.name.ilike(f"%{category}%"),
                    models.Category.id == category,
                )
            )
            .first()
        )
        if cat_obj:
            query = query.filter(models.Product.category_id == cat_obj.id)
        else:
            # If category name filter directly matches nothing in categories table, check product category_id directly
            query = query.filter(models.Product.category_id == category)

    # Filter by price range
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    # Filter by material
    if material:
        query = query.filter(models.Product.material.ilike(f"%{material}%"))

    # Filter by color
    if color:
        query = query.filter(models.Product.color.ilike(f"%{color}%"))

    # Filter by rating
    if rating is not None:
        query = query.filter(models.Product.rating >= rating)

    # Keyword search across name, description, material, color
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_pattern),
                models.Product.description.ilike(search_pattern),
                models.Product.material.ilike(search_pattern),
                models.Product.color.ilike(search_pattern),
            )
        )

    # Sorting
    if sort == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort == "rating_desc":
        query = query.order_by(models.Product.rating.desc())
    elif sort == "newest":
        query = query.order_by(models.Product.created_at.desc())
    else:
        query = query.order_by(models.Product.created_at.desc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return schemas.ProductListResponse(
        items=[schemas.ProductResponse.model_validate(p) for p in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )
    return product


@router.post(
    "/products",
    response_model=schemas.ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(product_in: schemas.ProductCreate, db: Session = Depends(get_db)):
    if product_in.category_id:
        category = (
            db.query(models.Category)
            .filter(models.Category.id == product_in.category_id)
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {product_in.category_id} not found",
            )

    new_product = models.Product(
        id=str(uuid.uuid4()),
        category_id=product_in.category_id,
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        material=product_in.material,
        color=product_in.color,
        finish_options=product_in.finish_options,
        dimension_options=product_in.dimension_options,
        rating=product_in.rating,
        image_url=product_in.image_url,
        stock_quantity=product_in.stock_quantity,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product
