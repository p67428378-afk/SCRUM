import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models.account import Account
from server.models.transfer import Transfer
from server.services.fraud_service import validate_transfer


def execute_transfer(db: Session, sender_id: str, receiver_id: str, amount: float) -> Transfer:
    """
    Executes atomic account debiting, receiver crediting, and transfer record creation.
    """
    sender = db.query(Account).filter(Account.id == sender_id).with_for_update().first() if db.bind.dialect.name != "sqlite" else db.query(Account).filter(Account.id == sender_id).first()
    if not sender:
        raise HTTPException(
            status_code=404,
            detail=f"Sender account with id '{sender_id}' not found"
        )

    receiver = db.query(Account).filter(Account.id == receiver_id).with_for_update().first() if db.bind.dialect.name != "sqlite" else db.query(Account).filter(Account.id == receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=404,
            detail=f"Receiver account with id '{receiver_id}' not found"
        )

    # Perform synchronous fraud and balance checks
    validate_transfer(sender, receiver, amount)

    # Atomic balance adjustments
    sender.balance -= amount
    receiver.balance += amount

    transfer = Transfer(
        id=str(uuid.uuid4()),
        sender_id=sender.id,
        receiver_id=receiver.id,
        amount=amount,
        status="COMPLETED",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    return transfer


def list_transfers(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Transfer).order_by(Transfer.created_at.desc()).offset(skip).limit(limit).all()


def get_transfer_by_id(db: Session, transfer_id: str):
    transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return transfer
