from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from server.database import get_db
from server.models import User, UserProfile, Account, AuditLog
from server.schemas import AdminUserResponse, AuditLogListResponse
from server.auth import get_current_admin

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
