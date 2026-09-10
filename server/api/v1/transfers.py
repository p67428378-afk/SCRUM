import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.transfer import TransferCreate, TransferResponse, AccountResponse
from server.services.transfer_service import TransferService

router = APIRouter(prefix="/transfers", tags=["transfers"])


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Initiate a P2P money transfer",
    description="Accepts sender_id, receiver_id, and amount. Validates fraud limit (> $10,000) and balance sufficiency.",
)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
):
    return TransferService.process_transfer(db=db, transfer_in=transfer_in)


@router.get(
    "",
    response_model=List[TransferResponse],
    status_code=status.HTTP_200_OK,
    summary="List transfers",
    description="Retrieve a paginated list of transfer transactions.",
)
def list_transfers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return TransferService.get_transfers(db=db, skip=skip, limit=limit)


@router.get(
    "/{transfer_id}",
    response_model=TransferResponse,
    status_code=status.HTTP_200_OK,
    summary="Get transfer by ID",
)
def get_transfer(
    transfer_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    transfer = TransferService.get_transfer_by_id(db=db, transfer_id=transfer_id)
    if not transfer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transfer not found")
    return transfer
