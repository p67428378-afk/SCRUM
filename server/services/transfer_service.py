from decimal import Decimal
from typing import List, Tuple
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models.account import Account
from server.models.transfer import Transfer
from server.schemas.transfer import TransferCreate

FRAUD_THRESHOLD = Decimal("10000.00")


class TransferService:
    @staticmethod
    def process_transfer(db: Session, payload: TransferCreate) -> Transfer:
        amount_decimal = Decimal(str(payload.amount))

        # 1. Synchronous Fraud Threshold Evaluation
        if amount_decimal > FRAUD_THRESHOLD:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blocked: Fraud threshold exceeded",
            )

        if payload.sender_id == payload.receiver_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot transfer to the same account",
            )

        # 2. Account Existence & Row-Level Lock Check
        sender = (
            db.query(Account)
            .filter(Account.id == payload.sender_id)
            .with_for_update()
            .first()
        )
        if not sender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender account not found",
            )

        receiver = (
            db.query(Account)
            .filter(Account.id == payload.receiver_id)
            .with_for_update()
            .first()
        )
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver account not found",
            )

        # 3. Synchronous Available Balance Check
        if sender.balance < amount_decimal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds",
            )

        # 4. Atomic Balance Deductions & Ledger Creation
        sender.balance = sender.balance - amount_decimal
        receiver.balance = receiver.balance + amount_decimal

        transfer = Transfer(
            sender_id=payload.sender_id,
            receiver_id=payload.receiver_id,
            amount=amount_decimal,
            status="COMPLETED",
        )
        db.add(transfer)
        return transfer

    @staticmethod
    def get_transfers(
        db: Session, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Transfer], int]:
        query = db.query(Transfer).order_by(Transfer.created_at.desc())
        total = query.count()
        transfers = query.offset(skip).limit(limit).all()
        return transfers, total

    @staticmethod
    def get_transfer_by_id(db: Session, transfer_id: UUID) -> Transfer | None:
        return db.query(Transfer).filter(Transfer.id == transfer_id).first()
