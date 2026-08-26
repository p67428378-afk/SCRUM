from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category
from server.schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    category_type: Optional[str] = Query(
        None, alias="type", description="Filter by type: income, expense, or both"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Category)
    if category_type:
        query = query.filter(
            (Category.type == category_type) | (Category.type == "both")
        )
    return query.order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Category).filter(Category.name.ilike(payload.name.strip())).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    category = Category(
        name=payload.name.strip(),
        type=payload.type,
        is_predefined=payload.is_predefined,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/{id}", response_model=CategoryResponse)
def get_category(
    id: str,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    id: str,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    if category.is_predefined:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Predefined categories cannot be deleted",
        )

    db.delete(category)
    db.commit()
    return None
