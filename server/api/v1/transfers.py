from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.account import Account
from server.schemas.transfer import (
    TransferCreate,
    TransferResponse,
    AccountResponse,
)
from server.services.transfer_service import (
    execute_transfer,
    list_transfers,
    get_transfer_by_id,
)

router = APIRouter(tags=["transfers"])


@router.post(
    "/transfers",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit P2P fund transfer"
)
def create_transfer(
    payload: TransferCreate,
    db: Session = Depends(get_db)
):
    return execute_transfer(
        db=db,
        sender_id=payload.sender_id,
        receiver_id=payload.receiver_id,
        amount=payload.amount,
    )


@router.get(
    "/transfers",
    response_model=List[TransferResponse],
    status_code=status.HTTP_200_OK,
    summary="List recent transfers"
)
def get_transfers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return list_transfers(db=db, skip=skip, limit=limit)


@router.get(
    "/transfers/{transfer_id}",
    response_model=TransferResponse,
    status_code=status.HTTP_200_OK,
    summary="Get transfer by ID"
)
def get_transfer(
    transfer_id: str,
    db: Session = Depends(get_db)
):
    return get_transfer_by_id(db=db, transfer_id=transfer_id)


@router.get(
    "/accounts/{account_id}",
    response_model=AccountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get account by ID"
)
def get_account(
    account_id: str,
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get(
    "/accounts",
    response_model=List[AccountResponse],
    status_code=status.HTTP_200_OK,
    summary="List all accounts"
)
def get_all_accounts(
    db: Session = Depends(get_db)
):
    return db.query(Account).all()
