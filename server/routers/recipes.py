from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Product, Ingredient, Recipe
from server.schemas import RecipeCreate, RecipeResponse

router = APIRouter(tags=["Recipes"])


@router.get(
    "/api/v1/products/{product_id}/recipes", response_model=List[RecipeResponse]
)
def get_product_recipes(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    recipes = db.query(Recipe).filter(Recipe.product_id == product_id).all()
    res = []
    for r in recipes:
        res.append(
            RecipeResponse(
                id=r.id,
                product_id=r.product_id,
                ingredient_id=r.ingredient_id,
                quantity_required=r.quantity_required,
                ingredient_name=r.ingredient.name if r.ingredient else None,
                ingredient_unit=r.ingredient.unit if r.ingredient else None,
                created_at=r.created_at,
            )
        )
    return res


@router.post(
    "/api/v1/products/{product_id}/recipes",
    response_model=RecipeResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_recipe_to_product(
    product_id: str, recipe_in: RecipeCreate, db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    ingredient = (
        db.query(Ingredient).filter(Ingredient.id == recipe_in.ingredient_id).first()
    )
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Ingredient not found"
        )

    existing = (
        db.query(Recipe)
        .filter(
            Recipe.product_id == product_id,
            Recipe.ingredient_id == recipe_in.ingredient_id,
        )
        .first()
    )
    if existing:
        existing.quantity_required = recipe_in.quantity_required
        db.commit()
        db.refresh(existing)
        recipe = existing
    else:
        recipe = Recipe(
            product_id=product_id,
            ingredient_id=recipe_in.ingredient_id,
            quantity_required=recipe_in.quantity_required,
        )
        db.add(recipe)
        db.commit()
        db.refresh(recipe)

    return RecipeResponse(
        id=recipe.id,
        product_id=recipe.product_id,
        ingredient_id=recipe.ingredient_id,
        quantity_required=recipe.quantity_required,
        ingredient_name=ingredient.name,
        ingredient_unit=ingredient.unit,
        created_at=recipe.created_at,
    )


@router.delete("/api/v1/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: str, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe entry not found"
        )
    db.delete(recipe)
    db.commit()
    return None
