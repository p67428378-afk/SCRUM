from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Loan, Member, User
from server.schemas import FinePaymentRequest, FinePaymentResponse, MessageResponse
from server.routers.auth import require_staff_or_admin, get_current_user
from server.services.fine_calculator import calculate_overdue_fine, SUSPENSION_THRESHOLD

router = APIRouter(prefix="/api/v1", tags=["fines"])


@router.post("/fines/{target_id}/pay", response_model=FinePaymentResponse)
def pay_fine_by_id(
    target_id: str,
    payment_in: FinePaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    amount = payment_in.amount_paid
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than zero",
        )

    # 1. Try resolving target_id as Loan
    loan = db.query(Loan).filter(Loan.id == target_id).first()
    if loan:
        member = loan.member
        loan_id = loan.id
        loan.fine_amount = max(0.0, round(loan.fine_amount - amount, 2))
        member.unpaid_fines = max(0.0, round(member.unpaid_fines - amount, 2))
    else:
        # 2. Try resolving target_id as Member
        member = db.query(Member).filter(Member.id == target_id).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target ID '{target_id}' does not match any Loan or Member",
            )
        loan_id = None
        member.unpaid_fines = max(0.0, round(member.unpaid_fines - amount, 2))

    # Re-evaluate suspension status
    if member.unpaid_fines <= SUSPENSION_THRESHOLD and member.status == "SUSPENDED":
        member.status = "ACTIVE"

    db.commit()
    db.refresh(member)

    return FinePaymentResponse(
        message="Payment processed successfully",
        loan_id=loan_id,
        member_id=member.id,
        amount_paid=amount,
        remaining_unpaid_fines=member.unpaid_fines,
        member_status=member.status,
    )


@router.get("/fines/members/{member_id}")
def get_member_fines(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID '{member_id}' not found",
        )

    user_role = (current_user.role or "").upper()
    if user_role not in ["STAFF", "ADMIN"] and current_user.id != member.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only view your own fine balance",
        )

    return {
        "member_id": member.id,
        "unpaid_fines": member.unpaid_fines,
        "status": member.status,
        "is_suspended": member.status == "SUSPENDED",
    }


@router.post("/tasks/recalculate-overdue-fines", response_model=MessageResponse)
def recalculate_overdue_fines(
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    active_loans = db.query(Loan).filter(Loan.status.in_(["BORROWED", "OVERDUE"])).all()
    updated_count = 0
    for loan in active_loans:
        due = (
            loan.due_date.replace(tzinfo=None)
            if loan.due_date.tzinfo
            else loan.due_date
        )
        if now > due:
            prev_fine = loan.fine_amount
            new_fine = calculate_overdue_fine(loan.due_date, now)
            loan.status = "OVERDUE"
            loan.fine_amount = new_fine
            fine_diff = new_fine - prev_fine
            if fine_diff > 0:
                loan.member.unpaid_fines = round(
                    loan.member.unpaid_fines + fine_diff, 2
                )
                if loan.member.unpaid_fines > SUSPENSION_THRESHOLD:
                    loan.member.status = "SUSPENDED"
            updated_count += 1

    db.commit()
    return MessageResponse(
        message=f"Recalculation complete. Updated {updated_count} overdue loans."
    )
