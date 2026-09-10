import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas.transfer import TransferCreate, TransferResponse
from server.services.transfer_service import TransferService

router = APIRouter(prefix="/api/v1/transfers", tags=["transfers"])


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a peer-to-peer money transfer",
    description="Initiates a secure P2P transfer with synchronous fraud threshold check and account balance verification.",
)
def create_transfer(
    payload: TransferCreate,
    db: Session = Depends(get_db),
) -> TransferResponse:
    transfer = TransferService.execute_transfer(db=db, payload=payload)
    return transfer


@router.get(
    "",
    response_model=List[TransferResponse],
    status_code=status.HTTP_200_OK,
    summary="List transfer transactions",
)
def list_transfers(
    sender_id: Optional[uuid.UUID] = Query(None, description="Filter by sender UUID"),
    receiver_id: Optional[uuid.UUID] = Query(
        None, description="Filter by receiver UUID"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> List[TransferResponse]:
    return TransferService.list_transfers(
        db=db,
        sender_id=sender_id,
        receiver_id=receiver_id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{transfer_id}",
    response_model=TransferResponse,
    status_code=status.HTTP_200_OK,
    summary="Get transfer by ID",
)
def get_transfer(
    transfer_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> TransferResponse:
    transfer = TransferService.get_transfer_by_id(db=db, transfer_id=transfer_id)
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found",
        )
    return transfer
