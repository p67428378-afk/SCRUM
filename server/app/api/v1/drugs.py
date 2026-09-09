from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app.schemas.drug import (
    DrugCreate,
    DrugUpdate,
    DrugResponse,
    DrugListResponse,
)
from server.app.services import drug_service

router = APIRouter(prefix="/drugs", tags=["Drugs"])


@router.get("", response_model=DrugListResponse)
def list_drugs(
    skip: int = Query(0, ge=0, description="Items to skip for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Max items to return"),
    search: Optional[str] = Query(
        None,
        description="Search term for name, generic name, category, manufacturer, batch",
    ),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    """Retrieve paginated list of drugs with search filter, total count, and alert metric summary."""
    items, total, low_stock_count, near_expiry_count = drug_service.get_drugs(
        db=db, skip=skip, limit=limit, search=search, category=category
    )
    return DrugListResponse(
        items=items,
        total=total,
        low_stock_count=low_stock_count,
        near_expiry_count=near_expiry_count,
    )


@router.post("", response_model=DrugResponse, status_code=status.HTTP_201_CREATED)
def create_drug(
    drug_in: DrugCreate,
    db: Session = Depends(get_db),
):
    """Create a new drug inventory record."""
    return drug_service.create_drug(db=db, drug_in=drug_in)


@router.get("/{drug_id}", response_model=DrugResponse)
def get_drug(
    drug_id: str,
    db: Session = Depends(get_db),
):
    """Fetch details for a specific drug by UUID."""
    drug = drug_service.get_drug_by_id(db=db, drug_id=drug_id)
    if not drug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drug with ID '{drug_id}' not found",
        )
    return drug


@router.put("/{drug_id}", response_model=DrugResponse)
def update_drug(
    drug_id: str,
    drug_in: DrugUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing drug record."""
    drug = drug_service.update_drug(db=db, drug_id=drug_id, drug_in=drug_in)
    if not drug:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drug with ID '{drug_id}' not found",
        )
    return drug


@router.delete("/{drug_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drug(
    drug_id: str,
    db: Session = Depends(get_db),
):
    """Delete a drug record by UUID."""
    success = drug_service.delete_drug(db=db, drug_id=drug_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drug with ID '{drug_id}' not found",
        )
    return None
