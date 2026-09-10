from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.account import Account
from server.schemas.account import (
    AccountCreate,
    AccountResponse,
)
from server.schemas.transfer import HTTPErrorResponse

router = APIRouter()


@router.post(
    "",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new bank account",
)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
) -> AccountResponse:
    account = Account(
        user_name=payload.user_name,
        balance=payload.balance,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get(
    "",
    response_model=List[AccountResponse],
    status_code=status.HTTP_200_OK,
    summary="List all accounts",
)
def list_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> List[AccountResponse]:
    accounts = (
        db.query(Account)
        .order_by(Account.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return accounts


@router.get(
    "/{account_id}",
    response_model=AccountResponse,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": HTTPErrorResponse, "description": "Account not found"}},
    summary="Get account by ID",
)
def get_account(
    account_id: UUID,
    db: Session = Depends(get_db),
) -> AccountResponse:
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return account
