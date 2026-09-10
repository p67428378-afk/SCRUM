import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from server.models.transfer import Transfer
from server.models.account import Account
from server.schemas.transfer import TransferCreate

FRAUD_LIMIT = Decimal("10000.00")
DEFAULT_INITIAL_BALANCE = Decimal("10000.00")


class TransferService:
    @staticmethod
    def process_transfer(db: Session, transfer_in: TransferCreate) -> Transfer:
        amount = Decimal(str(transfer_in.amount))

        # 1. Synchronous Fraud Check: amount > $10,000
        if amount > FRAUD_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blocked: Fraud threshold exceeded",
            )

        # 2. Synchronous Balance Check
        sender = db.query(Account).filter(Account.id == transfer_in.sender_id).first()
        if sender is None:
            # Create sender account with default balance to allow standard transfers
            sender = Account(
                id=transfer_in.sender_id,
                account_name="Checking Account",
                balance=DEFAULT_INITIAL_BALANCE,
                currency="USD",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(sender)
            db.flush()

        if sender.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds",
            )

        # 3. Deduct from sender
        sender.balance -= amount
        sender.updated_at = datetime.now(timezone.utc)

        # 4. Credit to receiver (if account exists, or create receiver account)
        receiver = db.query(Account).filter(Account.id == transfer_in.receiver_id).first()
        if receiver is None:
            receiver = Account(
                id=transfer_in.receiver_id,
                account_name="Recipient Account",
                balance=amount,
                currency="USD",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(receiver)
            db.flush()
        else:
            receiver.balance += amount
            receiver.updated_at = datetime.now(timezone.utc)

        # 5. Create transfer record
        now = datetime.now(timezone.utc)
        transfer_record = Transfer(
            id=uuid.uuid4(),
            sender_id=transfer_in.sender_id,
            receiver_id=transfer_in.receiver_id,
            amount=amount,
            status="COMPLETED",
            created_at=now,
            updated_at=now,
        )
        db.add(transfer_record)
        db.commit()
        db.refresh(transfer_record)

        return transfer_record

    @staticmethod
    def get_transfers(db: Session, skip: int = 0, limit: int = 50) -> List[Transfer]:
        return db.query(Transfer).order_by(Transfer.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_transfer_by_id(db: Session, transfer_id: uuid.UUID) -> Optional[Transfer]:
        return db.query(Transfer).filter(Transfer.id == transfer_id).first()

    @staticmethod
    def get_accounts(db: Session) -> List[Account]:
        return db.query(Account).all()

    @staticmethod
    def get_account_by_id(db: Session, account_id: uuid.UUID) -> Optional[Account]:
        return db.query(Account).filter(Account.id == account_id).first()
