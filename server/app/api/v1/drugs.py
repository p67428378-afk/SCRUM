from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.drug import DrugCreate, DrugUpdate, DrugResponse, DrugListResponse
from app.services import drug_service

router = APIRouter(prefix="/drugs", tags=["Drugs"])


@router.get("", response_model=DrugListResponse)
def list_drugs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_low_stock: Optional[bool] = Query(None),
    is_near_expiry: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    items, total, low_stock_count, near_expiry_count = drug_service.get_drugs(
        db=db,
        skip=skip,
        limit=limit,
        search=search,
        category=category,
        is_low_stock=is_low_stock,
        is_near_expiry=is_near_expiry,
    )
    return {
        "items": items,
        "total": total,
        "low_stock_count": low_stock_count,
        "near_expiry_count": near_expiry_count,
    }


@router.post("", response_model=DrugResponse, status_code=status.HTTP_201_CREATED)
def create_drug(
    drug_in: DrugCreate,
    db: Session = Depends(get_db),
):
    return drug_service.create_drug(db=db, drug_in=drug_in)


@router.get("/{id}", response_model=DrugResponse)
def get_drug(
    id: str,
    db: Session = Depends(get_db),
):
    drug = drug_service.get_drug_by_id(db=db, drug_id=id)
    if not drug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Drug not found"
        )
    return drug


@router.put("/{id}", response_model=DrugResponse)
def update_drug(
    id: str,
    drug_in: DrugUpdate,
    db: Session = Depends(get_db),
):
    updated = drug_service.update_drug(db=db, drug_id=id, drug_in=drug_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Drug not found"
        )
    return updated


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drug(
    id: str,
    db: Session = Depends(get_db),
):
    success = drug_service.delete_drug(db=db, drug_id=id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Drug not found"
        )
    return None
