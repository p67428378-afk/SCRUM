from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Product, Recipe, Ingredient
from server.schemas import ProductCreate, ProductUpdate, ProductResponse, RecipeResponse

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


def _format_product_response(product: Product) -> ProductResponse:
    recipe_responses = []
    for r in product.recipes:
        r_resp = RecipeResponse(
            id=r.id,
            product_id=r.product_id,
            ingredient_id=r.ingredient_id,
            quantity_required=r.quantity_required,
            ingredient_name=r.ingredient.name if r.ingredient else None,
            ingredient_unit=r.ingredient.unit if r.ingredient else None,
            created_at=r.created_at,
        )
        recipe_responses.append(r_resp)

    return ProductResponse(
        id=product.id,
        name=product.name,
        category=product.category,
        price=product.price,
        description=product.description,
        created_at=product.created_at,
        updated_at=product.updated_at,
        recipes=recipe_responses,
    )


@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = Query(None, description="Filter products by category"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    products = query.offset(skip).limit(limit).all()
    return [_format_product_response(p) for p in products]


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        name=product_in.name,
        category=product_in.category,
        price=product_in.price,
        description=product_in.description,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    if product_in.recipes:
        for r_in in product_in.recipes:
            # Check if ingredient exists
            ing = (
                db.query(Ingredient).filter(Ingredient.id == r_in.ingredient_id).first()
            )
            if not ing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ingredient ID {r_in.ingredient_id} not found",
                )
            recipe = Recipe(
                product_id=product.id,
                ingredient_id=r_in.ingredient_id,
                quantity_required=r_in.quantity_required,
            )
            db.add(recipe)
        db.commit()
        db.refresh(product)

    return _format_product_response(product)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return _format_product_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str, product_in: ProductUpdate, db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    if product_in.name is not None:
        product.name = product_in.name
    if product_in.category is not None:
        product.category = product_in.category
    if product_in.price is not None:
        product.price = product_in.price
    if product_in.description is not None:
        product.description = product_in.description

    db.commit()
    db.refresh(product)
    return _format_product_response(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    db.delete(product)
    db.commit()
    return None
