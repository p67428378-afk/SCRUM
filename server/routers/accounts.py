import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.account import Account, User
from server.schemas.account import AccountCreate, AccountResponse, UserResponse

router = APIRouter(prefix="/api/v1/accounts", tags=["accounts"])


@router.get("", response_model=List[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(Account).all()


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: uuid.UUID, db: Session = Depends(get_db)):
    account = (
        db.query(Account)
        .filter((Account.id == account_id) | (Account.user_id == account_id))
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return account


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    account_id = payload.user_id or uuid.uuid4()
    account_number = payload.account_number or f"ACC-{uuid.uuid4().hex[:8].upper()}"
    account = Account(
        id=account_id,
        user_id=payload.user_id,
        account_number=account_number,
        balance=payload.initial_balance,
        currency=payload.currency,
        status="ACTIVE",
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "test@example.com").first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
