import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category
from server.schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def get_categories(
    type: Optional[str] = Query(None, description="Filter categories by type"),
    db: Session = Depends(get_db),
):
    query = db.query(Category)
    if type:
        query = query.filter((Category.type == type) | (Category.type == "both"))
    return query.order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    new_cat = Category(
        id=str(uuid.uuid4()),
        name=category_in.name,
        type=category_in.type,
        is_predefined=category_in.is_predefined,
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat
