from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.transfer import Transfer
from server.schemas.transfer import TransferCreate, TransferResponse, HTTPError
from server.services.transfer_service import TransferService

router = APIRouter(prefix="/transfers", tags=["Transfers"])


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": HTTPError, "description": "Validation or Fraud rule violation"},
        422: {"description": "Invalid input format"},
    },
)
def create_transfer(payload: TransferCreate, db: Session = Depends(get_db)):
    return TransferService.execute_transfer(db, payload)


@router.get("", response_model=List[TransferResponse])
def list_transfers(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    transfers = (
        db.query(Transfer)
        .order_by(Transfer.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return transfers


@router.get("/{transfer_id}", response_model=TransferResponse)
def get_transfer(transfer_id: str, db: Session = Depends(get_db)):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer
