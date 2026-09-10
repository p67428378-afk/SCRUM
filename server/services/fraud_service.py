from fastapi import HTTPException
from server.models.account import Account

MAX_TRANSFER_THRESHOLD = 10000.00


def validate_transfer(sender: Account, receiver: Account, amount: float):
    """
    Synchronous fraud and funds validation rules.
    1. Checks if amount > $10,000.00 -> 400 'Blocked: Fraud threshold exceeded'
    2. Checks if sender balance < amount -> 400 'Insufficient funds'
    3. Checks if sender and receiver are the same account.
    """
    if amount > MAX_TRANSFER_THRESHOLD:
        raise HTTPException(
            status_code=400,
            detail="Blocked: Fraud threshold exceeded"
        )

    if sender.balance < amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds"
        )

    if sender.id == receiver.id:
        raise HTTPException(
            status_code=400,
            detail="Sender and receiver cannot be the same account"
        )
