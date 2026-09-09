from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import (
    LoanCheckoutRequest,
    LoanResponse,
    LoanWithDetailsResponse,
    ErrorResponse,
)
from server.auth import (
    get_current_admin_user,
    get_optional_current_user,
)
from server import crud

router = APIRouter(prefix="/api/v1", tags=["loans"])


@router.post(
    "/loans/checkout",
    response_model=LoanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Execute checkout for a book",
    responses={
        400: {"model": ErrorResponse, "description": "Book not available for checkout"},
        404: {"model": ErrorResponse, "description": "Book or Patron not found"},
    },
)
def checkout_book(
    request: LoanCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    patron_id = request.patron_id
    if not patron_id:
        if current_user:
            patron_id = current_user.id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="patron_id must be provided when unauthenticated",
            )
    elif current_user and current_user.role != "admin" and current_user.id != patron_id:
        # Non-admin patrons cannot checkout on behalf of others
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot checkout books for another patron",
        )

    loan = crud.create_loan(db, book_id=request.book_id, patron_id=patron_id)
    return loan


@router.post(
    "/loans/return/{loan_id}",
    response_model=LoanResponse,
    summary="Process return of a borrowed book",
    responses={
        400: {"model": ErrorResponse, "description": "Loan already returned"},
        404: {"model": ErrorResponse, "description": "Loan not found"},
    },
)
def return_book(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    loan = crud.get_loan_by_id(db, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    if (
        current_user
        and current_user.role != "admin"
        and current_user.id != loan.patron_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to return this loan",
        )

    updated_loan = crud.return_loan(db, loan_id)
    return updated_loan


@router.post(
    "/loans/renew/{loan_id}",
    response_model=LoanResponse,
    summary="Extend loan due date by 14 days",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Cannot renew overdue or returned loan",
        },
        404: {"model": ErrorResponse, "description": "Loan not found"},
    },
)
def renew_book(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    loan = crud.get_loan_by_id(db, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    if (
        current_user
        and current_user.role != "admin"
        and current_user.id != loan.patron_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to renew this loan",
        )

    updated_loan = crud.renew_loan(db, loan_id)
    return updated_loan


@router.get(
    "/loans/overdue",
    response_model=List[LoanWithDetailsResponse],
    summary="[Admin] Fetch list of all active overdue loans",
)
def get_overdue_loans(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    overdue_loans = crud.get_overdue_loans(db)
    return overdue_loans


@router.get(
    "/patrons/{patron_id}/loans",
    response_model=List[LoanWithDetailsResponse],
    summary="Fetch active and historical loan records for a given patron",
)
def get_patron_loans(
    patron_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if current_user and current_user.role != "admin" and current_user.id != patron_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view other patrons' loans",
        )

    loans = crud.get_patron_loans(db, patron_id)
    return loans


@router.get(
    "/loans",
    response_model=List[LoanWithDetailsResponse],
    summary="[Admin] List all circulation loans",
)
def list_all_loans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    loans = crud.get_all_loans(db, skip=skip, limit=limit)
    return loans
