import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.transfer import AccountResponse
from server.services.transfer_service import TransferService

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get(
    "",
    response_model=List[AccountResponse],
    status_code=status.HTTP_200_OK,
    summary="List accounts",
)
def list_accounts(db: Session = Depends(get_db)):
    return TransferService.get_accounts(db=db)


@router.get(
    "/{account_id}",
    response_model=AccountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get account by ID",
)
def get_account(account_id: uuid.UUID, db: Session = Depends(get_db)):
    account = TransferService.get_account_by_id(db=db, account_id=account_id)
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return account
