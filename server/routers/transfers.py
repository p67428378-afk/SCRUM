from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import TransferCreate, TransferResponse
from server.services.transfer_service import (
    execute_transfer,
    get_transfers,
    get_transfer_by_id,
)

router = APIRouter(prefix="/transfers", tags=["Transfers"])


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    transfer_in: TransferCreate,
    db: Session = Depends(get_db),
):
    """Initiates a synchronous peer-to-peer money transfer between sender and receiver."""
    return execute_transfer(
        db=db,
        sender_id=transfer_in.sender_id,
        receiver_id=transfer_in.receiver_id,
        amount=transfer_in.amount,
    )


@router.get("", response_model=List[TransferResponse])
def list_transfers(
    sender_id: Optional[str] = Query(None, description="Filter by sender ID"),
    receiver_id: Optional[str] = Query(None, description="Filter by receiver ID"),
    user_id: Optional[str] = Query(None, description="Filter by sender or receiver ID"),
    skip: int = Query(0, ge=0, description="Pagination skip"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
):
    """List transfer history with optional filters and pagination."""
    return get_transfers(
        db=db,
        sender_id=sender_id,
        receiver_id=receiver_id,
        user_id=user_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{transfer_id}", response_model=TransferResponse)
def get_transfer(
    transfer_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific transfer by its unique UUID."""
    transfer = get_transfer_by_id(db=db, transfer_id=transfer_id)
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transfer with ID '{transfer_id}' not found",
        )
    return transfer
