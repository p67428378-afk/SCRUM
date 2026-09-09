from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter(prefix="/api/v1/recipes", tags=["recipes"])


@router.get("", response_model=List[schemas.Recipe])
def list_recipes(
    skip: int = 0,
    limit: int = 100,
    tea_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crud.get_recipes(db=db, skip=skip, limit=limit, tea_id=tea_id)


@router.post("", response_model=schemas.Recipe, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe_in: schemas.RecipeCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_recipe(db=db, recipe_in=recipe_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{recipe_id}", response_model=schemas.Recipe)
def get_recipe(recipe_id: str, db: Session = Depends(get_db)):
    recipe = crud.get_recipe_by_id(db=db, recipe_id=recipe_id)
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with ID '{recipe_id}' not found",
        )
    return recipe
