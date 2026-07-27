from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User, Account, Transfer, AuditLog, UserProfile
from server.schemas import TransferRequest, TransferResponse
from server.auth import get_current_user
from server.services.core_banking import CoreBankingService

router = APIRouter(prefix="/api/v1/transfers", tags=["Transfers"])


def log_audit_event(
    db: Session, user_id: str, event_type: str, details: dict, ip_address: str
):
    audit_log = AuditLog(
        user_id=user_id,
        event_type=event_type,
        details=details,
        ip_address=ip_address,
    )
    db.add(audit_log)
    db.commit()


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def create_transfer(
    req: TransferRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ip_address = request.client.host if request.client else "127.0.0.1"

    # Verify source account belongs to user
    source_account = (
        db.query(Account)
        .filter(
            Account.id == req.source_account_ref, Account.user_id == current_user.id
        )
        .first()
    )
    if not source_account:
        raise HTTPException(
            status_code=400,
            detail="Source account not found or does not belong to user",
        )

    # Verify destination account exists and belongs to user
    dest_account = (
        db.query(Account)
        .filter(
            Account.id == req.destination_account_ref,
            Account.user_id == current_user.id,
        )
        .first()
    )
    if not dest_account:
        raise HTTPException(
            status_code=400,
            detail="Destination account not found or does not belong to user",
        )

    if source_account.id == dest_account.id:
        raise HTTPException(
            status_code=400, detail="Source and destination accounts must be different"
        )

    # Execute transfer via Core Banking System
    try:
        core_tx_id = CoreBankingService.execute_transfer(
            db=db,
            source_account_id=source_account.id,
            dest_account_id=dest_account.id,
            amount=req.amount,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Create transfer record
    transfer = Transfer(
        user_id=current_user.id,
        source_account_ref=source_account.id,
        destination_account_ref=dest_account.id,
        amount=req.amount,
        status="completed",
        core_banking_tx_id=core_tx_id,
    )
    db.add(transfer)
    db.commit()

    # Trigger alert if enabled
    profile = (
        db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    )
    if profile and profile.alert_on_transfer:
        if req.amount >= profile.alert_threshold:
            # In a real system, this would send an SMS or email via Twilio/SendGrid
            print(
                f"ALERT: Transfer of {req.amount} initiated from account {source_account.id} to {dest_account.id}"
            )

    log_audit_event(
        db,
        current_user.id,
        "FUNDS_TRANSFER",
        {
            "transfer_id": transfer.id,
            "source_account": source_account.id,
            "destination_account": dest_account.id,
            "amount": float(req.amount),
        },
        ip_address,
    )

    return transfer


@router.get("/{transferId}", response_model=TransferResponse)
def get_transfer_status(
    transferId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transfer = (
        db.query(Transfer)
        .filter(Transfer.id == transferId, Transfer.user_id == current_user.id)
        .first()
    )
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer
