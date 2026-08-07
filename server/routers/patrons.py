import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from server.database import get_db
from server.models import User, UserRole, UserStatus, Loan, LoanStatus, Fine, FineStatus
from server.schemas import (
    UserResponse,
    PatronDetailResponse,
    PatronCreate,
    PatronUpdate,
)
from server.auth import get_password_hash
from server.dependencies import get_current_user, require_librarian

router = APIRouter(prefix="/patrons", tags=["patrons"])


@router.get("", response_model=List[UserResponse])
def list_patrons(
    search: Optional[str] = Query(None, description="Search by full name or email"),
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by status (ACTIVE, SUSPENDED)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    query = db.query(User).filter(User.role == UserRole.PATRON.value)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(User.full_name.ilike(search_pattern), User.email.ilike(search_pattern))
        )
    if status_filter:
        query = query.filter(User.status == status_filter.upper())

    patrons = query.offset(skip).limit(limit).all()
    return patrons


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_patron(
    patron_in: PatronCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    existing = db.query(User).filter(User.email == patron_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A patron account with this email already exists",
        )

    status_val = patron_in.status.value if patron_in.status else UserStatus.ACTIVE.value

    user = User(
        id=str(uuid.uuid4()),
        full_name=patron_in.full_name,
        email=patron_in.email,
        hashed_password=get_password_hash(patron_in.password),
        role=UserRole.PATRON.value,
        status=status_val,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{patron_id}", response_model=PatronDetailResponse)
def get_patron_detail(
    patron_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.LIBRARIAN.value and current_user.id != patron_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot view another patron's details",
        )

    patron = db.query(User).filter(User.id == patron_id).first()
    if not patron:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patron not found"
        )

    active_loans_count = (
        db.query(Loan)
        .filter(
            Loan.patron_id == patron_id,
            Loan.return_date.is_(None),
            Loan.status.in_([LoanStatus.BORROWED.value, LoanStatus.OVERDUE.value]),
        )
        .count()
    )

    unpaid_fines_sum = (
        db.query(func.sum(Fine.amount))
        .filter(Fine.patron_id == patron_id, Fine.status == FineStatus.UNPAID.value)
        .scalar()
        or 0.0
    )

    return PatronDetailResponse(
        id=patron.id,
        full_name=patron.full_name,
        email=patron.email,
        role=patron.role,
        status=patron.status,
        created_at=patron.created_at,
        active_loans_count=active_loans_count,
        unpaid_fines_balance=round(unpaid_fines_sum, 2),
    )


@router.put("/{patron_id}", response_model=UserResponse)
def update_patron(
    patron_id: str,
    patron_in: PatronUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    patron = (
        db.query(User)
        .filter(User.id == patron_id, User.role == UserRole.PATRON.value)
        .first()
    )
    if not patron:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patron not found"
        )

    if patron_in.full_name is not None:
        patron.full_name = patron_in.full_name
    if patron_in.email is not None and patron_in.email != patron.email:
        existing = db.query(User).filter(User.email == patron_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
            )
        patron.email = patron_in.email
    if patron_in.status is not None:
        patron.status = patron_in.status.value

    db.commit()
    db.refresh(patron)
    return patron
