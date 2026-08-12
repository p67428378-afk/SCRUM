import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server import models, schemas
from server.database import get_db
from server.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/loans", tags=["loans"])


@router.post(
    "/checkout",
    response_model=schemas.LoanResponse,
    status_code=status.HTTP_201_CREATED,
)
def checkout_book(
    request: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Fetch book
    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    # Check available copies
    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Book is out of stock (no available copies)",
        )

    # Check active loan limit (max 5)
    active_loans_count = (
        db.query(models.Loan)
        .filter(
            models.Loan.user_id == current_user.id,
            models.Loan.status == models.LoanStatus.ACTIVE,
        )
        .count()
    )
    if active_loans_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Active loan limit reached (maximum 5 books allowed)",
        )

    # Check if user already borrowed this book and hasn't returned it
    existing_loan = (
        db.query(models.Loan)
        .filter(
            models.Loan.user_id == current_user.id,
            models.Loan.book_id == book.id,
            models.Loan.status == models.LoanStatus.ACTIVE,
        )
        .first()
    )
    if existing_loan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active loan for this book",
        )

    now = datetime.now(timezone.utc)
    due_date = now + timedelta(days=14)

    loan = models.Loan(
        user_id=current_user.id,
        book_id=book.id,
        checkout_date=now,
        due_date=due_date,
        status=models.LoanStatus.ACTIVE,
        is_renewed=False,
    )

    book.available_copies -= 1

    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.post("/return/{loan_id}", response_model=schemas.LoanResponse)
def return_book(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan record not found",
        )

    # Check permission (User's own loan or Librarian)
    if (
        loan.user_id != current_user.id
        and current_user.role != models.UserRole.LIBRARIAN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to return this loan",
        )

    if loan.status == models.LoanStatus.RETURNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book has already been returned",
        )

    now = datetime.now(timezone.utc)
    loan.return_date = now
    loan.status = models.LoanStatus.RETURNED

    # Restore available copies
    book = db.query(models.Book).filter(models.Book.id == loan.book_id).first()
    if book:
        book.available_copies += 1

    # Check fine calculation ($0.50 / day overdue)
    # Compare timezone-aware due_date and now
    due = loan.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    if now > due:
        overdue_seconds = (now - due).total_seconds()
        overdue_days = math.ceil(overdue_seconds / 86400)
        if overdue_days > 0:
            fine_amount = overdue_days * 0.50
            fine = models.Fine(
                loan_id=loan.id,
                user_id=loan.user_id,
                amount=fine_amount,
                status=models.FineStatus.UNPAID,
            )
            db.add(fine)

    db.commit()
    db.refresh(loan)
    return loan


@router.post("/renew/{loan_id}", response_model=schemas.LoanResponse)
def renew_loan(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan record not found",
        )

    if (
        loan.user_id != current_user.id
        and current_user.role != models.UserRole.LIBRARIAN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to renew this loan",
        )

    if loan.status != models.LoanStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew a returned loan",
        )

    if loan.is_renewed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan has already been renewed once",
        )

    now = datetime.now(timezone.utc)
    due = loan.due_date
    if due.tzinfo is None:
        due = due.replace(tzinfo=timezone.utc)

    if now > due:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew an overdue loan",
        )

    loan.due_date = due + timedelta(days=14)
    loan.is_renewed = True

    db.commit()
    db.refresh(loan)
    return loan


@router.get("/my-loans", response_model=List[schemas.LoanResponse])
def get_my_loans(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_query = db.query(models.Loan).filter(models.Loan.user_id == current_user.id)
    if status_filter:
        db_query = db_query.filter(models.Loan.status == status_filter.upper())

    loans = db_query.order_by(models.Loan.created_at.desc()).all()

    # Populate fine field for each loan if exists
    for loan in loans:
        fine = db.query(models.Fine).filter(models.Fine.loan_id == loan.id).first()
        if fine:
            loan.fine = fine

    return loans
