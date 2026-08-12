from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from server import models, schemas
from server.database import get_db
from server.dependencies import get_current_user, require_role

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=schemas.UserProfileResponse)
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    active_loans_count = (
        db.query(models.Loan)
        .filter(
            models.Loan.user_id == current_user.id,
            models.Loan.status == models.LoanStatus.ACTIVE,
        )
        .count()
    )

    unpaid_fines_sum = (
        db.query(func.sum(models.Fine.amount))
        .filter(
            models.Fine.user_id == current_user.id,
            models.Fine.status == models.FineStatus.UNPAID,
        )
        .scalar()
    ) or 0.0

    return schemas.UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        active_loans_count=active_loans_count,
        total_fines_unpaid=float(unpaid_fines_sum),
    )


@router.get("", response_model=List[schemas.UserResponse])
@router.get("/", response_model=List[schemas.UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    users = db.query(models.User).all()
    return users


@router.get("/{user_id}/loans", response_model=List[schemas.LoanResponse])
def get_user_loans(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    loans = db.query(models.Loan).filter(models.Loan.user_id == user_id).all()
    for loan in loans:
        fine = db.query(models.Fine).filter(models.Fine.loan_id == loan.id).first()
        if fine:
            loan.fine = fine

    return loans
