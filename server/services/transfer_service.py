import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.models import Transfer, Account, User

FRAUD_THRESHOLD = Decimal("10000.00")


def find_account(db: Session, identifier: str) -> Optional[Account]:
    """Find an account by account ID, user ID, account number, email, or handle."""
    if not identifier:
        return None

    # 1. Search directly in accounts table
    account = (
        db.query(Account)
        .filter(
            or_(
                Account.id == identifier,
                Account.user_id == identifier,
                Account.account_number == identifier,
            )
        )
        .first()
    )

    if account:
        return account

    # 2. Search via users table
    user = (
        db.query(User)
        .filter(
            or_(
                User.id == identifier,
                User.email == identifier,
                User.handle == identifier,
            )
        )
        .first()
    )

    if user and user.accounts:
        return user.accounts[0]

    return None


def execute_transfer(
    db: Session,
    sender_id: str,
    receiver_id: str,
    amount: Decimal,
) -> Transfer:
    """Execute a peer-to-peer money transfer with synchronous fraud and balance checks."""
    # 1. Validate positive amount
    if amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be greater than zero",
        )

    # 2. Synchronous Fraud Threshold Enforcement ($10,000 hard limit)
    if amount > FRAUD_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blocked: Fraud threshold exceeded",
        )

    # 3. Prevent self-transfer
    if sender_id.strip().lower() == receiver_id.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer funds to the same account",
        )

    # 4. Account balance verification
    sender_account = find_account(db, sender_id)
    if not sender_account or Decimal(str(sender_account.balance)) < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds",
        )

    # 5. Execute transfer atomically
    receiver_account = find_account(db, receiver_id)

    # Deduct from sender
    sender_account.balance = Decimal(str(sender_account.balance)) - amount

    # Credit receiver if account exists
    if receiver_account:
        receiver_account.balance = Decimal(str(receiver_account.balance)) + amount

    now = datetime.now(timezone.utc)
    transfer = Transfer(
        id=str(uuid.uuid4()),
        sender_id=sender_id,
        receiver_id=receiver_id,
        amount=amount,
        status="COMPLETED",
        created_at=now,
        updated_at=now,
    )

    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    return transfer


def get_transfers(
    db: Session,
    sender_id: Optional[str] = None,
    receiver_id: Optional[str] = None,
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> List[Transfer]:
    """Retrieve transfer records with optional filtering and pagination."""
    query = db.query(Transfer)

    if user_id:
        query = query.filter(
            or_(
                Transfer.sender_id == user_id,
                Transfer.receiver_id == user_id,
            )
        )
    if sender_id:
        query = query.filter(Transfer.sender_id == sender_id)
    if receiver_id:
        query = query.filter(Transfer.receiver_id == receiver_id)

    return query.order_by(Transfer.created_at.desc()).offset(skip).limit(limit).all()


def get_transfer_by_id(db: Session, transfer_id: str) -> Optional[Transfer]:
    """Retrieve a single transfer record by ID."""
    return db.query(Transfer).filter(Transfer.id == transfer_id).first()
