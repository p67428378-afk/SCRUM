from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time
from server.database import get_db
from server.models import User, Account, Transaction
from server.schemas import AccountResponse, TransactionListResponse
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def get_accounts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts


@router.get("/{accountId}/transactions", response_model=TransactionListResponse)
def get_account_transactions(
    accountId: str,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify account exists and belongs to user
    account = (
        db.query(Account)
        .filter(Account.id == accountId, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or does not belong to user"
        )

    query = db.query(Transaction).filter(Transaction.account_id == accountId)

    if category:
        query = query.filter(Transaction.category == category)

    if start_date:
        try:
            start_dt = datetime.combine(
                datetime.strptime(start_date, "%Y-%m-%d"), time.min
            )
            query = query.filter(Transaction.date >= start_dt)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_dt = datetime.combine(datetime.strptime(end_date, "%Y-%m-%d"), time.max)
            query = query.filter(Transaction.date <= end_dt)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    # Order by date descending for deterministic results
    query = query.order_by(Transaction.date.desc())

    total = query.count()
    transactions = query.offset(skip).limit(limit).all()

    return {"total": total, "transactions": transactions}
