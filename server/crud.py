import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from server.models import User, Book, Loan
from server.schemas import UserCreate, UserUpdate, BookCreate, BookUpdate
from server.auth import get_password_hash


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


# ----------------------
# User CRUD
# ----------------------
def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email.ilike(email.strip())).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        id=str(uuid.uuid4()),
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=user_in.role.lower().strip()
        if user_in.role in ["patron", "admin"]
        else "patron",
        is_active=True,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: str, user_update: UserUpdate) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_update.email and user_update.email.lower().strip() != user.email:
        existing = get_user_by_email(db, user_update.email)
        if existing and existing.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use by another account",
            )
        user.email = user_update.email.lower().strip()

    if user_update.full_name is not None:
        user.full_name = user_update.full_name.strip()

    if user_update.role is not None:
        user.role = user_update.role.lower().strip()

    if user_update.is_active is not None:
        user.is_active = user_update.is_active

    if user_update.password is not None:
        user.hashed_password = get_password_hash(user_update.password)

    user.updated_at = get_utc_now()
    db.commit()
    db.refresh(user)
    return user


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


# ----------------------
# Book CRUD
# ----------------------
def get_book_by_id(db: Session, book_id: str) -> Optional[Book]:
    return db.query(Book).filter(Book.id == book_id).first()


def get_book_by_isbn(db: Session, isbn: str) -> Optional[Book]:
    return db.query(Book).filter(Book.isbn == isbn.strip()).first()


def create_book(db: Session, book_in: BookCreate) -> Book:
    existing = get_book_by_isbn(db, book_in.isbn)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Book with ISBN '{book_in.isbn}' already exists",
        )

    total = book_in.total_copies
    avail = book_in.available_copies if book_in.available_copies is not None else total
    if avail > total:
        avail = total

    book = Book(
        id=str(uuid.uuid4()),
        title=book_in.title.strip(),
        author=book_in.author.strip(),
        isbn=book_in.isbn.strip(),
        genre=book_in.genre.strip(),
        total_copies=total,
        available_copies=avail,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def get_books(
    db: Session,
    q: Optional[str] = None,
    genre: Optional[str] = None,
    status_filter: Optional[str] = None,
    isbn: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> List[Book]:
    query = db.query(Book)

    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Book.title.ilike(pattern),
                Book.author.ilike(pattern),
                Book.genre.ilike(pattern),
                Book.isbn.ilike(pattern),
            )
        )

    if genre:
        query = query.filter(Book.genre.ilike(f"%{genre.strip()}%"))

    if isbn:
        query = query.filter(Book.isbn.ilike(f"%{isbn.strip()}%"))

    if status_filter:
        s = status_filter.lower().strip()
        if s in ["available", "in_stock"]:
            query = query.filter(Book.available_copies > 0)
        elif s in ["checked_out", "out_of_stock", "unavailable"]:
            query = query.filter(Book.available_copies == 0)

    return query.order_by(Book.title.asc()).offset(skip).limit(min(limit, 100)).all()


def update_book(db: Session, book_id: str, book_update: BookUpdate) -> Book:
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    if book_update.isbn and book_update.isbn != book.isbn:
        existing = get_book_by_isbn(db, book_update.isbn)
        if existing and existing.id != book_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Book with ISBN '{book_update.isbn}' already exists",
            )
        book.isbn = book_update.isbn.strip()

    if book_update.title is not None:
        book.title = book_update.title.strip()
    if book_update.author is not None:
        book.author = book_update.author.strip()
    if book_update.genre is not None:
        book.genre = book_update.genre.strip()
    if book_update.total_copies is not None:
        diff = book_update.total_copies - book.total_copies
        book.total_copies = book_update.total_copies
        book.available_copies = max(0, book.available_copies + diff)
    if book_update.available_copies is not None:
        book.available_copies = min(
            book.total_copies, max(0, book_update.available_copies)
        )

    book.updated_at = get_utc_now()
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: str) -> None:
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    db.delete(book)
    db.commit()


# ----------------------
# Loan CRUD & Workflows
# ----------------------
def get_loan_by_id(db: Session, loan_id: str) -> Optional[Loan]:
    return db.query(Loan).filter(Loan.id == loan_id).first()


def create_loan(db: Session, book_id: str, patron_id: str) -> Loan:
    # Verify book exists
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    # Verify patron exists
    patron = get_user_by_id(db, patron_id)
    if not patron:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patron not found",
        )

    # Check availability
    if book.available_copies <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book is not available for checkout (zero copies in stock)",
        )

    # Decrement available copies
    book.available_copies -= 1
    book.updated_at = get_utc_now()

    now = get_utc_now()
    due_date = now + timedelta(days=14)

    loan = Loan(
        id=str(uuid.uuid4()),
        book_id=book.id,
        patron_id=patron.id,
        checkout_date=now,
        due_date=due_date,
        return_date=None,
        status="active",
        created_at=now,
        updated_at=now,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


def return_loan(db: Session, loan_id: str) -> Loan:
    loan = get_loan_by_id(db, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    if loan.status == "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan has already been returned",
        )

    book = get_book_by_id(db, loan.book_id)
    if book:
        if book.available_copies < book.total_copies:
            book.available_copies += 1
            book.updated_at = get_utc_now()

    now = get_utc_now()
    loan.return_date = now
    loan.status = "returned"
    loan.updated_at = now

    db.commit()
    db.refresh(loan)
    return loan


def renew_loan(db: Session, loan_id: str) -> Loan:
    loan = get_loan_by_id(db, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found",
        )

    if loan.status == "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew a returned loan",
        )

    now = get_utc_now()
    due_utc = to_utc(loan.due_date)
    # If due_date is in past, check if overdue
    if due_utc and due_utc < now:
        loan.status = "overdue"
        loan.updated_at = now
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot renew an overdue book. Please return it to the library.",
        )

    # Extend due date by 14 days
    if due_utc:
        loan.due_date = due_utc + timedelta(days=14)
    else:
        loan.due_date = now + timedelta(days=14)
    loan.updated_at = now
    db.commit()
    db.refresh(loan)
    return loan


def get_overdue_loans(db: Session) -> List[Loan]:
    now = get_utc_now()
    loans = db.query(Loan).filter(Loan.status != "returned").all()

    overdue_loans = []
    for loan in loans:
        due = to_utc(loan.due_date)
        if due and due < now:
            if loan.status != "overdue":
                loan.status = "overdue"
                loan.updated_at = now
            overdue_loans.append(loan)
    db.commit()

    return overdue_loans


def get_patron_loans(db: Session, patron_id: str) -> List[Loan]:
    now = get_utc_now()
    loans = (
        db.query(Loan)
        .filter(Loan.patron_id == patron_id)
        .order_by(Loan.checkout_date.desc())
        .all()
    )
    for loan in loans:
        if loan.status == "active":
            due = to_utc(loan.due_date)
            if due and due < now:
                loan.status = "overdue"
                loan.updated_at = now
    db.commit()

    return (
        db.query(Loan)
        .filter(Loan.patron_id == patron_id)
        .order_by(Loan.checkout_date.desc())
        .all()
    )


def get_all_loans(db: Session, skip: int = 0, limit: int = 100) -> List[Loan]:
    now = get_utc_now()
    loans = (
        db.query(Loan)
        .order_by(Loan.checkout_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    for loan in loans:
        if loan.status == "active":
            due = to_utc(loan.due_date)
            if due and due < now:
                loan.status = "overdue"
                loan.updated_at = now
    db.commit()

    return (
        db.query(Loan)
        .order_by(Loan.checkout_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
