from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Ingredient
from server.schemas import (
    IngredientCreate,
    IngredientUpdate,
    IngredientResponse,
    StockAdjustment,
)

router = APIRouter(prefix="/api/v1/ingredients", tags=["Ingredients"])


def _format_ingredient_response(ing: Ingredient) -> IngredientResponse:
    is_low = ing.stock_quantity <= ing.reorder_threshold
    return IngredientResponse(
        id=ing.id,
        name=ing.name,
        unit=ing.unit,
        stock_quantity=ing.stock_quantity,
        reorder_threshold=ing.reorder_threshold,
        is_low_stock=is_low,
        created_at=ing.created_at,
        updated_at=ing.updated_at,
    )


@router.get("", response_model=List[IngredientResponse])
def list_ingredients(
    low_stock_only: bool = Query(
        False, description="Filter ingredients that are at or below reorder threshold"
    ),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Ingredient)
    if low_stock_only:
        query = query.filter(Ingredient.stock_quantity <= Ingredient.reorder_threshold)
    ingredients = query.offset(skip).limit(limit).all()
    return [_format_ingredient_response(i) for p in [ingredients] for i in p]


@router.post("", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
def create_ingredient(ing_in: IngredientCreate, db: Session = Depends(get_db)):
    existing = db.query(Ingredient).filter(Ingredient.name.ilike(ing_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ingredient '{ing_in.name}' already exists",
        )
    ing = Ingredient(
        name=ing_in.name,
        unit=ing_in.unit,
        stock_quantity=ing_in.stock_quantity,
        reorder_threshold=ing_in.reorder_threshold,
    )
    db.add(ing)
    db.commit()
    db.refresh(ing)
    return _format_ingredient_response(ing)


@router.get("/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
        )
    return _format_ingredient_response(ing)


@router.put("/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient(
    ingredient_id: str, ing_in: IngredientUpdate, db: Session = Depends(get_db)
):
    ing = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
        )

    if ing_in.name is not None:
        ing.name = ing_in.name
    if ing_in.unit is not None:
        ing.unit = ing_in.unit
    if ing_in.stock_quantity is not None:
        ing.stock_quantity = ing_in.stock_quantity
    if ing_in.reorder_threshold is not None:
        ing.reorder_threshold = ing_in.reorder_threshold

    db.commit()
    db.refresh(ing)
    return _format_ingredient_response(ing)


@router.post("/{ingredient_id}/adjust", response_model=IngredientResponse)
def adjust_stock(
    ingredient_id: str, adj: StockAdjustment, db: Session = Depends(get_db)
):
    ing = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
        )

    new_quantity = ing.stock_quantity + adj.quantity_change
    if new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reduce stock below 0. Current stock: {ing.stock_quantity} {ing.unit}",
        )
    ing.stock_quantity = new_quantity
    db.commit()
    db.refresh(ing)
    return _format_ingredient_response(ing)


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ingredient not found"
        )
    db.delete(ing)
    db.commit()
    return None
