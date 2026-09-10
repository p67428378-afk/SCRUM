from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Account, User
from server.schemas import (
    AccountResponse,
    BalanceResponse,
    UserResponse,
    DepositRequest,
)
from server.services.transfer_service import find_account

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    """List all accounts."""
    return db.query(Account).all()


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all registered users and their linked accounts."""
    return db.query(User).all()


@router.get("/balance/{identifier}", response_model=BalanceResponse)
def get_balance(identifier: str, db: Session = Depends(get_db)):
    """Get the available balance for a user or account identifier."""
    account = find_account(db, identifier)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account or user not found for identifier '{identifier}'",
        )
    return BalanceResponse(
        user_id=account.user_id,
        available_balance=float(account.balance),
        currency=account.currency,
        account_number=account.account_number,
    )


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: str, db: Session = Depends(get_db)):
    """Get an account by its ID."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with ID '{account_id}' not found",
        )
    return account


@router.post("/{account_id}/deposit", response_model=AccountResponse)
def deposit_funds(
    account_id: str,
    deposit_in: DepositRequest,
    db: Session = Depends(get_db),
):
    """Deposit funds into an account."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with ID '{account_id}' not found",
        )
    account.balance = Decimal(str(account.balance)) + deposit_in.amount
    db.commit()
    db.refresh(account)
    return account
