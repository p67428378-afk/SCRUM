import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.models.transfer import Transfer
from server.models.account import Account
from server.schemas.transfer import TransferCreate

FRAUD_THRESHOLD_AMOUNT = Decimal("10000.00")


class TransferService:
    @staticmethod
    def get_or_create_account(
        db: Session,
        account_or_user_id: uuid.UUID,
        default_balance: Decimal = Decimal("10000.00"),
    ) -> Account:
        """Find an account by ID or user_id, or create one with a default balance if not found."""
        account = (
            db.query(Account)
            .filter(
                (Account.id == account_or_user_id)
                | (Account.user_id == account_or_user_id)
            )
            .first()
        )
        if not account:
            account = Account(
                id=account_or_user_id,
                user_id=account_or_user_id,
                account_number=f"ACC-{account_or_user_id.hex[:8].upper()}",
                balance=default_balance,
                currency="USD",
                status="ACTIVE",
            )
            db.add(account)
            db.flush()
        return account

    @classmethod
    def execute_transfer(cls, db: Session, payload: TransferCreate) -> Transfer:
        amount = Decimal(str(payload.amount))

        # 1. Synchronous Fraud Threshold Enforcement
        # Block transfers exceeding $10,000.00 (amount > 10000.00)
        if amount > FRAUD_THRESHOLD_AMOUNT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blocked: Fraud threshold exceeded",
            )

        # 2. Account Balance Verification & Insufficient Funds Check
        sender_account = (
            db.query(Account)
            .filter(
                (Account.id == payload.sender_id)
                | (Account.user_id == payload.sender_id)
            )
            .first()
        )

        if not sender_account:
            # If account does not exist, initialize one with standard balance
            sender_account = cls.get_or_create_account(
                db, payload.sender_id, default_balance=Decimal("10000.00")
            )

        if Decimal(str(sender_account.balance)) < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds",
            )

        # 3. Debit sender & credit receiver
        receiver_account = (
            db.query(Account)
            .filter(
                (Account.id == payload.receiver_id)
                | (Account.user_id == payload.receiver_id)
            )
            .first()
        )
        if not receiver_account:
            receiver_account = cls.get_or_create_account(
                db, payload.receiver_id, default_balance=Decimal("0.00")
            )

        sender_account.balance = Decimal(str(sender_account.balance)) - amount
        receiver_account.balance = Decimal(str(receiver_account.balance)) + amount

        # 4. Create and persist Transfer record
        transfer = Transfer(
            id=uuid.uuid4(),
            sender_id=payload.sender_id,
            receiver_id=payload.receiver_id,
            amount=amount,
            status="COMPLETED",
        )
        db.add(transfer)

        try:
            db.commit()
            db.refresh(transfer)
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transfer transaction failed: {str(exc)}",
            )

        return transfer

    @staticmethod
    def list_transfers(
        db: Session,
        sender_id: Optional[uuid.UUID] = None,
        receiver_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Transfer]:
        query = db.query(Transfer)
        if sender_id:
            query = query.filter(Transfer.sender_id == sender_id)
        if receiver_id:
            query = query.filter(Transfer.receiver_id == receiver_id)
        return query.order_by(desc(Transfer.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_transfer_by_id(db: Session, transfer_id: uuid.UUID) -> Optional[Transfer]:
        return db.query(Transfer).filter(Transfer.id == transfer_id).first()
