import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Loan, Book, Member, User
from server.schemas import LoanCheckoutRequest, LoanResponse
from server.routers.auth import get_current_user, require_staff_or_admin
from server.services.fine_calculator import (
    calculate_overdue_fine,
    get_tier_borrow_limit,
    SUSPENSION_THRESHOLD,
    STANDARD_LOAN_DAYS,
)

router = APIRouter(prefix="/api/v1/loans", tags=["loans"])


@router.get("/my-loans", response_model=List[LoanResponse])
def get_my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.member:
        return []

    # Auto-refresh overdue fine calculations for active loans
    now = datetime.now(timezone.utc)
    loans = db.query(Loan).filter(Loan.member_id == current_user.member.id).all()
    for l in loans:
        d_due = l.due_date.replace(tzinfo=None) if l.due_date.tzinfo else l.due_date
        d_now = now.replace(tzinfo=None)
        if l.status == "BORROWED" and d_now > d_due:
            l.status = "OVERDUE"
            l.fine_amount = calculate_overdue_fine(l.due_date, now)
    db.commit()

    return loans


@router.get("", response_model=List[LoanResponse])
def list_loans(
    member_id: Optional[str] = Query(None),
    book_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    q = db.query(Loan)
    if member_id:
        q = q.filter(Loan.member_id == member_id)
    if book_id:
        q = q.filter(Loan.book_id == book_id)
    if status_filter:
        q = q.filter(Loan.status == status_filter.upper())

    loans = q.order_by(Loan.created_at.desc()).offset(skip).limit(limit).all()
    return loans


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID '{loan_id}' not found",
        )

    user_role = (current_user.role or "").upper()
    if user_role not in ["STAFF", "ADMIN"]:
        if not current_user.member or loan.member_id != current_user.member.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You can only view your own loans",
            )

    return loan


@router.post(
    "/checkout", response_model=LoanResponse, status_code=status.HTTP_201_CREATED
)
def checkout_book(
    checkout_in: LoanCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    member = db.query(Member).filter(Member.id == checkout_in.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID '{checkout_in.member_id}' not found",
        )

    # Check suspension
    if member.status == "SUSPENDED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member account is SUSPENDED. Checkout not allowed.",
        )

    # Check unpaid fines threshold
    if member.unpaid_fines > SUSPENSION_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Member has unpaid fines of ${member.unpaid_fines:.2f}, exceeding the ${SUSPENSION_THRESHOLD:.2f} threshold. Checkout not allowed.",
        )

    # Check tier borrowing limit
    active_loans_count = (
        db.query(Loan)
        .filter(Loan.member_id == member.id, Loan.status.in_(["BORROWED", "OVERDUE"]))
        .count()
    )

    max_allowed = get_tier_borrow_limit(member.membership_tier)
    if active_loans_count >= max_allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{member.membership_tier} membership limit of {max_allowed} active loans reached (currently has {active_loans_count}).",
        )

    # Check book availability
    book = db.query(Book).filter(Book.id == checkout_in.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{checkout_in.book_id}' not found",
        )

    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No available copies for book '{book.title}'",
        )

    # Decrement stock
    book.available_copies -= 1

    checkout_time = datetime.now(timezone.utc).replace(tzinfo=None)
    due_time = checkout_time + timedelta(days=STANDARD_LOAN_DAYS)

    loan = Loan(
        id=str(uuid.uuid4()),
        book_id=book.id,
        member_id=member.id,
        checkout_date=checkout_time,
        due_date=due_time,
        status="BORROWED",
        fine_amount=0.0,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/return", response_model=LoanResponse)
def return_book(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID '{loan_id}' not found",
        )

    if loan.status == "RETURNED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book has already been returned for this loan",
        )

    return_time = datetime.now(timezone.utc).replace(tzinfo=None)
    loan.return_date = return_time
    loan.status = "RETURNED"

    # Fine calculation
    fine = calculate_overdue_fine(loan.due_date, return_time)
    loan.fine_amount = fine
    if fine > 0:
        loan.member.unpaid_fines = round(loan.member.unpaid_fines + fine, 2)
        if loan.member.unpaid_fines > SUSPENSION_THRESHOLD:
            loan.member.status = "SUSPENDED"

    # Increment book stock
    if loan.book:
        loan.book.available_copies = min(
            loan.book.total_copies, loan.book.available_copies + 1
        )

    db.commit()
    db.refresh(loan)
    return loan


@router.post("/{loan_id}/renew", response_model=LoanResponse)
def renew_loan(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with ID '{loan_id}' not found",
        )

    user_role = (current_user.role or "").upper()
    if user_role not in ["STAFF", "ADMIN"]:
        if not current_user.member or loan.member_id != current_user.member.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You can only renew your own loans",
            )

    if loan.status == "RETURNED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew a completed/returned loan",
        )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    due = loan.due_date.replace(tzinfo=None) if loan.due_date.tzinfo else loan.due_date
    if loan.status == "OVERDUE" or now > due:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew an overdue loan. Please return the book and settle any fines.",
        )

    loan.due_date = due + timedelta(days=STANDARD_LOAN_DAYS)
    db.commit()
    db.refresh(loan)
    return loan
