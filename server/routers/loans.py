import uuid
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.database import get_db
from server.models import (
    User,
    UserRole,
    UserStatus,
    Book,
    BookStatus,
    Loan,
    LoanStatus,
    Fine,
    FineStatus,
)
from server.schemas import CheckoutRequest, LoanResponse, LoanReturnResponse
from server.dependencies import get_current_user, require_librarian

router = APIRouter(prefix="/loans", tags=["loans"])


@router.post(
    "/checkout", response_model=LoanResponse, status_code=status.HTTP_201_CREATED
)
def checkout_book(
    request: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Patron status check
    if current_user.status == UserStatus.SUSPENDED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Checkout blocked: Patron account is suspended",
        )

    # 2. Book existence & availability check
    book = db.query(Book).filter(Book.id == request.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )
    if book.status != BookStatus.AVAILABLE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Book is not available for checkout (current status: {book.status})",
        )

    # 3. Active loans limit check (max 5)
    active_loans_count = (
        db.query(Loan)
        .filter(
            Loan.patron_id == current_user.id,
            Loan.return_date.is_(None),
            Loan.status.in_([LoanStatus.BORROWED.value, LoanStatus.OVERDUE.value]),
        )
        .count()
    )

    if active_loans_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum limit of 5 active loans reached",
        )

    # 4. Unpaid fines limit check (exceeding $10.00 blocks checkout)
    unpaid_fines_sum = (
        db.query(func.sum(Fine.amount))
        .filter(
            Fine.patron_id == current_user.id, Fine.status == FineStatus.UNPAID.value
        )
        .scalar()
        or 0.0
    )

    if unpaid_fines_sum > 10.00:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Checkout blocked due to unpaid fines exceeding $10.00 (current balance: ${unpaid_fines_sum:.2f})",
        )

    now = datetime.utcnow()
    due = now + timedelta(days=14)

    # Create loan
    loan = Loan(
        id=str(uuid.uuid4()),
        patron_id=current_user.id,
        book_id=book.id,
        borrow_date=now,
        due_date=due,
        status=LoanStatus.BORROWED.value,
    )
    book.status = BookStatus.BORROWED.value

    db.add(loan)
    db.commit()
    db.refresh(loan)

    response = LoanResponse.from_orm(loan)
    response.book_title = book.title
    response.author = book.author
    return response


@router.post("/{loan_id}/return", response_model=LoanReturnResponse)
def return_book(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found"
        )

    # Authorize: patron who borrowed or librarian
    if (
        current_user.role != UserRole.LIBRARIAN.value
        and current_user.id != loan.patron_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot return a loan for another patron",
        )

    if loan.return_date is not None or loan.status == LoanStatus.RETURNED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book has already been returned",
        )

    now = datetime.utcnow()
    loan.return_date = now
    loan.status = LoanStatus.RETURNED.value

    # Update book status
    book = db.query(Book).filter(Book.id == loan.book_id).first()
    if book:
        book.status = BookStatus.AVAILABLE.value

    # Calculate fine ($0.50 per day past due date)
    fine_amount = 0.0
    if now > loan.due_date:
        delta = now - loan.due_date
        overdue_days = delta.days
        if overdue_days == 0 and delta.total_seconds() > 0:
            overdue_days = 1

        if overdue_days > 0:
            fine_amount = round(overdue_days * 0.50, 2)
            fine = Fine(
                id=str(uuid.uuid4()),
                loan_id=loan.id,
                patron_id=loan.patron_id,
                amount=fine_amount,
                status=FineStatus.UNPAID.value,
            )
            db.add(fine)

            # Check if patron's total unpaid fines now exceed $10.00
            patron = db.query(User).filter(User.id == loan.patron_id).first()
            if patron:
                total_unpaid = (
                    db.query(func.sum(Fine.amount))
                    .filter(
                        Fine.patron_id == patron.id,
                        Fine.status == FineStatus.UNPAID.value,
                    )
                    .scalar()
                    or 0.0
                )
                total_unpaid += fine_amount
                if total_unpaid > 10.00:
                    patron.status = UserStatus.SUSPENDED.value

    db.commit()
    db.refresh(loan)

    response_loan = LoanResponse.from_orm(loan)
    if book:
        response_loan.book_title = book.title
        response_loan.author = book.author

    msg = "Book returned successfully."
    if fine_amount > 0:
        msg += f" Late fee of ${fine_amount:.2f} assessed."

    return LoanReturnResponse(
        loan=response_loan, fine_assessed=fine_amount, message=msg
    )


@router.get("/my-loans", response_model=List[LoanResponse])
def get_my_loans(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    loans = (
        db.query(Loan)
        .filter(Loan.patron_id == current_user.id)
        .order_by(Loan.created_at.desc())
        .all()
    )
    results = []
    for l in loans:
        resp = LoanResponse.from_orm(l)
        if l.book:
            resp.book_title = l.book.title
            resp.author = l.book.author
        results.append(resp)
    return results


@router.get("", response_model=List[LoanResponse])
def list_all_loans(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    loans = (
        db.query(Loan).order_by(Loan.created_at.desc()).offset(skip).limit(limit).all()
    )
    results = []
    for l in loans:
        resp = LoanResponse.from_orm(l)
        if l.book:
            resp.book_title = l.book.title
            resp.author = l.book.author
        results.append(resp)
    return results
