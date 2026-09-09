from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.app.models.account import Account
from server.app.models.transfer import Transfer
from server.app.schemas.transfer import TransferCreate
from server.app.core.config import settings


class TransferService:
    @staticmethod
    def process_transfer(db: Session, transfer_in: TransferCreate) -> Transfer:
        sender_id_str = str(transfer_in.sender_id)
        receiver_id_str = str(transfer_in.receiver_id)
        amount = Decimal(str(transfer_in.amount))

        # 1. Amount validation
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Amount must be strictly greater than 0",
            )

        # 2. Fraud Check: Amount strictly > 10,000.00 is blocked immediately
        if amount > Decimal(str(settings.FRAUD_THRESHOLD)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blocked: Fraud threshold exceeded",
            )

        # 3. Check for same sender and receiver
        if sender_id_str == receiver_id_str:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sender and receiver accounts cannot be identical",
            )

        # 4. Fetch sender and receiver accounts
        sender_query = db.query(Account).filter(Account.id == sender_id_str)
        if db.bind and db.bind.dialect.name == "postgresql":
            sender_query = sender_query.with_for_update()
        sender = sender_query.first()

        if not sender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender account not found",
            )

        receiver_query = db.query(Account).filter(Account.id == receiver_id_str)
        if db.bind and db.bind.dialect.name == "postgresql":
            receiver_query = receiver_query.with_for_update()
        receiver = receiver_query.first()

        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver account not found",
            )

        # 5. Insufficient Funds Check: sender balance must be >= transfer amount
        if sender.balance < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds",
            )

        # 6. Execute atomic balance updates and create transfer entity
        sender.balance = sender.balance - amount
        receiver.balance = receiver.balance + amount

        transfer = Transfer(
            sender_id=sender_id_str,
            receiver_id=receiver_id_str,
            amount=amount,
            status="COMPLETED",
        )
        db.add(transfer)
        db.flush()
        return transfer
