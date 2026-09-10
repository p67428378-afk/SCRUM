import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models import Transfer, Account


FRAUD_THRESHOLD = 10000.00


def get_or_create_account(
    db: Session, account_id: str, default_balance: float = 10000.00
) -> Account:
    """Retrieve an existing account or initialize one with default balance."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        account = Account(
            id=account_id,
            balance=default_balance,
            email=f"{account_id}@example.com",
            role="user",
            is_active=True,
            is_verified=True,
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account


def process_transfer(
    db: Session, sender_id: str, receiver_id: str, amount: float
) -> Transfer:
    """
    Process a peer-to-peer money transfer.

    Enforces:
    1. Synchronous fraud detection: blocks amount > $10,000.00
    2. Balance check: verifies sender has sufficient funds
    3. Atomic balance update and transfer record creation
    """
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Transfer amount must be greater than zero.",
        )

    # 1. Synchronous Fraud Check
    if amount > FRAUD_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blocked: Fraud threshold exceeded",
        )

    # 2. Sender Account & Balance Validation
    sender = db.query(Account).filter(Account.id == sender_id).first()
    if not sender:
        # If sender is not already registered in DB, default to standard user balance
        sender = get_or_create_account(db, sender_id, default_balance=10000.00)

    if sender.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds"
        )

    # 3. Receiver Account Fetch/Creation
    receiver = db.query(Account).filter(Account.id == receiver_id).first()
    if not receiver:
        receiver = get_or_create_account(db, receiver_id, default_balance=0.00)

    # 4. Atomic Execution
    try:
        sender.balance -= amount
        receiver.balance += amount

        transfer = Transfer(
            id=str(uuid.uuid4()),
            sender_id=sender_id,
            receiver_id=receiver_id,
            amount=amount,
            status="COMPLETED",
        )
        db.add(transfer)
        db.commit()
        db.refresh(transfer)
        return transfer
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transfer processing failed: {str(e)}",
        )


def get_transfers(
    db: Session, skip: int = 0, limit: int = 20, user_id: Optional[str] = None
) -> List[Transfer]:
    """Retrieve list of transfers with optional user filtering and pagination."""
    query = db.query(Transfer)
    if user_id:
        query = query.filter(
            (Transfer.sender_id == user_id) | (Transfer.receiver_id == user_id)
        )
    return query.order_by(Transfer.created_at.desc()).offset(skip).limit(limit).all()


def get_transfer_by_id(db: Session, transfer_id: str) -> Optional[Transfer]:
    """Retrieve transfer details by ID."""
    return db.query(Transfer).filter(Transfer.id == transfer_id).first()


def get_account_balance(db: Session, account_id: str) -> Account:
    """Retrieve account details including balance."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        account = get_or_create_account(db, account_id, default_balance=25000.00)
    return account
