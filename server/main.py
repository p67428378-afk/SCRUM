import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server import crud, schemas
from server.database import get_db, init_db, seed_data, SessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and seed data on startup
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Recipe Management API",
    description="API for viewing, adding, and removing food recipes.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/recipes", response_model=List[schemas.Recipe])
def read_recipes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieve recipes with pagination and optional search.
    """
    return crud.get_recipes(db, skip=skip, limit=limit, search=search)


@app.get("/api/v1/recipes/{recipe_id}", response_model=schemas.Recipe)
def read_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Get detailed recipe information by ID.
    """
    db_recipe = crud.get_recipe(db, recipe_id=recipe_id)
    if db_recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )
    return db_recipe


@app.post(
    "/api/v1/recipes",
    response_model=schemas.Recipe,
    status_code=status.HTTP_201_CREATED,
)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """
    Create a new recipe with ingredients.
    """
    try:
        return crud.create_recipe(db=db, recipe=recipe)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@app.delete("/api/v1/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: str, db: Session = Depends(get_db)):
    """
    Delete a recipe by ID.
    """
    success = crud.delete_recipe(db=db, recipe_id=recipe_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found"
        )
    return
