from fastapi import HTTPException
from sqlalchemy.orm import Session
from server.models.account import Account


class FraudService:
    @staticmethod
    def validate_transfer(db: Session, sender_id: str, amount: float) -> Account:
        # Rule 1: Fraud threshold check ($10,000 limit)
        if amount > 10000.0:
            raise HTTPException(
                status_code=400,
                detail="Blocked: Fraud threshold exceeded",
            )

        # Rule 2: Account balance check
        sender = db.query(Account).filter(Account.id == sender_id).first()
        if not sender or sender.balance < amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient funds",
            )

        return sender
