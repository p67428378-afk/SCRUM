import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.database import get_db
from server.models import User, UserStatus, Fine, FineStatus
from server.schemas import FineResponse, FineCreate, FineUpdate, PayFineResponse
from server.dependencies import get_current_user, require_librarian

router = APIRouter(prefix="/fines", tags=["fines"])


@router.get("", response_model=List[FineResponse])
def list_fines(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    fines = (
        db.query(Fine).order_by(Fine.created_at.desc()).offset(skip).limit(limit).all()
    )
    return fines


@router.post("", response_model=FineResponse, status_code=status.HTTP_201_CREATED)
def create_fine_adjustment(
    fine_in: FineCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    status_val = fine_in.status.value if fine_in.status else FineStatus.UNPAID.value

    fine = Fine(
        id=str(uuid.uuid4()),
        loan_id=fine_in.loan_id,
        patron_id=fine_in.patron_id,
        amount=fine_in.amount,
        status=status_val,
    )
    db.add(fine)

    # Check if patron's total unpaid fines now exceed $10.00
    if status_val == FineStatus.UNPAID.value:
        patron = db.query(User).filter(User.id == fine_in.patron_id).first()
        if patron:
            total_unpaid = (
                db.query(func.sum(Fine.amount))
                .filter(
                    Fine.patron_id == patron.id, Fine.status == FineStatus.UNPAID.value
                )
                .scalar()
                or 0.0
            )
            total_unpaid += fine_in.amount
            if total_unpaid > 10.00:
                patron.status = UserStatus.SUSPENDED.value

    db.commit()
    db.refresh(fine)
    return fine


@router.put("/{fine_id}", response_model=FineResponse)
def update_fine_adjustment(
    fine_id: str,
    fine_in: FineUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fine not found"
        )

    if fine_in.amount is not None:
        fine.amount = fine_in.amount
    if fine_in.status is not None:
        fine.status = fine_in.status.value

    db.commit()
    db.refresh(fine)
    return fine


@router.post("/{fine_id}/pay", response_model=PayFineResponse)
def pay_fine(
    fine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fine = db.query(Fine).filter(Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Fine not found"
        )

    if current_user.role != "LIBRARIAN" and current_user.id != fine.patron_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot pay a fine for another patron",
        )

    if fine.status == FineStatus.PAID.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Fine has already been paid"
        )

    fine.status = FineStatus.PAID.value

    remaining_balance = (
        db.query(func.sum(Fine.amount))
        .filter(
            Fine.patron_id == fine.patron_id,
            Fine.status == FineStatus.UNPAID.value,
            Fine.id != fine.id,
        )
        .scalar()
        or 0.0
    )

    patron = db.query(User).filter(User.id == fine.patron_id).first()
    if (
        patron
        and remaining_balance <= 10.00
        and patron.status == UserStatus.SUSPENDED.value
    ):
        patron.status = UserStatus.ACTIVE.value

    db.commit()
    db.refresh(fine)

    return PayFineResponse(
        fine=FineResponse.from_orm(fine),
        remaining_balance=round(remaining_balance, 2),
        message=f"Fine of ${fine.amount:.2f} successfully paid.",
    )
