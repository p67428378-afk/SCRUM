from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import random
import uuid

from server.database import get_db
from server.models import User, UserProfile, Account, AuditLog, Transaction
from server.schemas import (
    AdminUserResponse,
    AuditLogListResponse,
    AccountCreateRequest,
    AccountResponse,
    AccountUpdateRequest,
    UserLockRequest,
    ForcePasswordResetRequest,
)
from server.auth import get_current_admin, get_password_hash

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/users/{userId}", response_model=AdminUserResponse)
def admin_get_user(
    userId: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == userId).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")

    accounts = db.query(Account).filter(Account.user_id == userId).all()

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "is_active": user.is_active,
        "profile": {"full_name": profile.full_name, "address": profile.address},
        "accounts": [
            {
                "id": acc.id,
                "account_type": acc.account_type,
                "account_number_masked": acc.account_number_masked,
                "balance": acc.balance,
                "status": acc.status,
            }
            for acc in accounts
        ],
    }


@router.get("/logs", response_model=AuditLogListResponse)
def admin_get_logs(
    event_type: Optional[str] = None,
    user_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if event_type:
        query = query.filter(AuditLog.event_type == event_type)

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    # Order by timestamp descending for deterministic results
    query = query.order_by(AuditLog.timestamp.desc())

    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return {"total": total, "logs": logs}


@router.post("/accounts", response_model=AccountResponse, status_code=201)
def admin_open_account(
    req: AccountCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not req.user_id:
        raise HTTPException(
            status_code=400, detail="user_id is required for admin account opening"
        )

    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.account_type not in ["Checking", "Savings"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid account type. Must be Checking or Savings",
        )

    # Generate random masked account number
    random_suffix = f"{random.randint(1000, 9999)}"
    account_number_masked = f"...{random_suffix}"

    account = Account(
        user_id=user.id,
        account_type=req.account_type,
        account_number_masked=account_number_masked,
        balance=req.initial_deposit,
        status="active",
    )
    db.add(account)
    db.flush()

    if req.initial_deposit > 0:
        tx = Transaction(
            account_id=account.id,
            description="Initial Deposit (Admin)",
            category="Deposit",
            amount=req.initial_deposit,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        db.add(tx)

    db.commit()
    db.refresh(account)
    return account


@router.put("/accounts/{accountId}", response_model=AccountResponse)
def admin_update_account(
    accountId: str,
    req: AccountUpdateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    account = db.query(Account).filter(Account.id == accountId).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if req.account_type is not None:
        if req.account_type not in ["Checking", "Savings"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid account type. Must be Checking or Savings",
            )
        account.account_type = req.account_type

    if req.status is not None:
        if req.status not in ["active", "restricted", "closed"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Must be active, restricted, or closed",
            )
        account.status = req.status

    db.commit()
    db.refresh(account)
    return account


@router.put("/users/{userId}/lock")
def admin_lock_user(
    userId: str,
    req: UserLockRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = req.is_active
    db.commit()

    status_str = "activated" if req.is_active else "locked/deactivated"
    return {"detail": f"User account has been successfully {status_str}."}


@router.post("/users/{userId}/force-password-reset")
def admin_force_password_reset(
    userId: str,
    req: ForcePasswordResetRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    return {"detail": "User password has been successfully reset."}
