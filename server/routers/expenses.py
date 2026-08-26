import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category, Transaction
from server.schemas import TransactionCreate, TransactionResponse, TransactionUpdate

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses & Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    search: Optional[str] = Query(None, description="Search term in description"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    type: Optional[str] = Query(None, description="Filter by type (income/expense)"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if type:
        query = query.filter(Transaction.type == type)
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


@router.post(
    "", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
def create_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == tx_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with id {tx_in.category_id} not found",
        )

    new_tx = Transaction(
        id=str(uuid.uuid4()),
        amount=tx_in.amount,
        type=tx_in.type,
        date=tx_in.date,
        description=tx_in.description,
        category_id=tx_in.category_id,
        payment_method=tx_in.payment_method,
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx


@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {tx_id} not found",
        )
    return tx


@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: str, tx_in: TransactionUpdate, db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {tx_id} not found",
        )

    update_data = tx_in.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = (
            db.query(Category).filter(Category.id == update_data["category_id"]).first()
        )
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with id {update_data['category_id']} not found",
            )

    for field, value in update_data.items():
        setattr(tx, field, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {tx_id} not found",
        )
    db.delete(tx)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
