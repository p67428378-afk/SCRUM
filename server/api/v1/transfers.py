from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.transfer import (
    TransferCreate,
    TransferResponse,
    HTTPErrorResponse,
)
from server.services.transfer_service import TransferService

router = APIRouter()


@router.post(
    "",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {
            "model": HTTPErrorResponse,
            "description": "Business rule or fraud violation",
        },
        404: {"model": HTTPErrorResponse, "description": "Account not found"},
    },
    summary="Create a new peer-to-peer transfer",
)
def create_transfer(
    payload: TransferCreate,
    db: Session = Depends(get_db),
) -> TransferResponse:
    try:
        transfer = TransferService.process_transfer(db, payload)
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
            detail=f"An unexpected error occurred: {str(e)}",
        )


@router.get(
    "",
    response_model=List[TransferResponse],
    status_code=status.HTTP_200_OK,
    summary="List all transfers with pagination",
)
def list_transfers(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(100, ge=1, le=500, description="Limit for pagination"),
    db: Session = Depends(get_db),
) -> List[TransferResponse]:
    transfers, _ = TransferService.get_transfers(db, skip=skip, limit=limit)
    return transfers


@router.get(
    "/{transfer_id}",
    response_model=TransferResponse,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": HTTPErrorResponse, "description": "Transfer not found"}},
    summary="Get transfer by ID",
)
def get_transfer(
    transfer_id: UUID,
    db: Session = Depends(get_db),
) -> TransferResponse:
    transfer = TransferService.get_transfer_by_id(db, transfer_id)
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transfer not found",
        )
    return transfer
