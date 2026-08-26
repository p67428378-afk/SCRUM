from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category, Transaction
from server.schemas import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses"])


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    search: Optional[str] = Query(None, description="Search keyword in description"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    transaction_type: Optional[str] = Query(None, alias="type", description="Filter by type (income or expense)"),
    start_date: Optional[date] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date filter (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Pagination limit"),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search.strip()}%"))
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    return (
        query.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    transaction = Transaction(
        amount=round(float(payload.amount), 2),
        type=payload.type,
        date=payload.date,
        description=payload.description.strip(),
        category_id=payload.category_id,
        payment_method=payload.payment_method.strip() if payload.payment_method else None,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{id}", response_model=TransactionResponse)
def get_transaction(
    id: str,
    db: Session = Depends(get_db),
):
    transaction = db.query(Transaction).filter(Transaction.id == id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return transaction


@router.put("/{id}", response_model=TransactionResponse)
def update_transaction(
    id: str,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
):
    transaction = db.query(Transaction).filter(Transaction.id == id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"] is not None:
        category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    if "amount" in update_data and update_data["amount"] is not None:
        update_data["amount"] = round(float(update_data["amount"]), 2)
    if "description" in update_data and update_data["description"] is not None:
        update_data["description"] = update_data["description"].strip()
    if "payment_method" in update_data and update_data["payment_method"] is not None:
        update_data["payment_method"] = update_data["payment_method"].strip()

    for key, val in update_data.items():
        setattr(transaction, key, val)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    id: str,
    db: Session = Depends(get_db),
):
    transaction = db.query(Transaction).filter(Transaction.id == id).first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    db.delete(transaction)
    db.commit()
    return None
