import uuid
from sqlalchemy.orm import Session
from server.models.account import Account
from server.models.transfer import Transfer
from server.schemas.transfer import TransferCreate
from server.services.fraud_service import FraudService


class TransferService:
    @staticmethod
    def execute_transfer(db: Session, payload: TransferCreate) -> Transfer:
        sender_id_str = str(payload.sender_id)
        receiver_id_str = str(payload.receiver_id)
        amount = float(payload.amount)

        # Synchronous Fraud & Funds Check
        sender = FraudService.validate_transfer(db, sender_id_str, amount)

        # Ensure receiver exists
        receiver = db.query(Account).filter(Account.id == receiver_id_str).first()
        if not receiver:
            receiver = Account(
                id=receiver_id_str,
                account_number=f"ACC-{receiver_id_str[:8]}",
                owner_name="Apex Recipient",
                email=f"receiver-{receiver_id_str[:8]}@example.com",
                balance=0.0,
            )
            db.add(receiver)
            db.flush()

        # Atomic debit and credit
        sender_bal = float(sender.balance)
        receiver_bal = float(receiver.balance)
        sender.balance = sender_bal - amount  # type: ignore[assignment]
        receiver.balance = receiver_bal + amount  # type: ignore[assignment]

        transfer = Transfer(
            id=str(uuid.uuid4()),
            sender_id=sender_id_str,
            receiver_id=receiver_id_str,
            amount=amount,
            status="COMPLETED",
        )
        db.add(transfer)
        db.commit()
        db.refresh(transfer)
        return transfer
