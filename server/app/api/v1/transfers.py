from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from server.app.core.database import get_db
from server.app.schemas.transfer import (
    TransferCreate,
    TransferResponse,
    AccountResponse,
)
from server.app.models.account import Account
from server.app.models.transfer import Transfer
from server.app.services.transfer_service import TransferService

router = APIRouter(prefix="/transfers", tags=["transfers"])


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
):
    try:
        transfer = TransferService.process_transfer(db=db, transfer_in=transfer_in)
        db.commit()
        db.refresh(transfer)
        return transfer
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during transfer: {str(e)}",
        )


@router.get("", response_model=List[TransferResponse], status_code=status.HTTP_200_OK)
def list_transfers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    transfers = (
        db.query(Transfer)
        .order_by(Transfer.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return transfers


@router.get(
    "/accounts", response_model=List[AccountResponse], status_code=status.HTTP_200_OK
)
def list_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    accounts = (
        db.query(Account)
        .order_by(Account.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return accounts


@router.get(
    "/accounts/{account_id}",
    response_model=AccountResponse,
    status_code=status.HTTP_200_OK,
)
def get_account(
    account_id: UUID,
    db: Session = Depends(get_db),
):
    account = db.query(Account).filter(Account.id == str(account_id)).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )
    return account
