import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.database import get_db
from server.models import Book, Loan, User
from server.schemas import BookCreate, BookUpdate, BookResponse
from server.routers.auth import require_staff_or_admin

router = APIRouter(prefix="/api/v1/books", tags=["books"])


@router.get("", response_model=List[BookResponse])
def list_books(
    query: Optional[str] = Query(None, description="Search ISBN, title, or author"),
    search: Optional[str] = Query(None, description="Alias for query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    available_only: Optional[bool] = Query(
        False, description="Show only available books"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Book)
    search_term = query or search
    if search_term:
        search_filter = f"%{search_term}%"
        q = q.filter(
            or_(
                Book.title.ilike(search_filter),
                Book.author.ilike(search_filter),
                Book.isbn.ilike(search_filter),
            )
        )
    if category:
        q = q.filter(Book.category.ilike(f"%{category}%"))
    if available_only:
        q = q.filter(Book.available_copies > 0)

    books = q.offset(skip).limit(limit).all()
    return books


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' not found",
        )
    return book


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    existing = db.query(Book).filter(Book.isbn == book_in.isbn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A book with ISBN '{book_in.isbn}' already exists",
        )

    book = Book(
        id=str(uuid.uuid4()),
        isbn=book_in.isbn,
        title=book_in.title,
        author=book_in.author,
        category=book_in.category,
        total_copies=book_in.total_copies,
        available_copies=book_in.total_copies,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: str,
    book_in: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' not found",
        )

    if book_in.title is not None:
        book.title = book_in.title
    if book_in.author is not None:
        book.author = book_in.author
    if book_in.category is not None:
        book.category = book_in.category
    if book_in.total_copies is not None:
        active_loans_count = (
            db.query(Loan)
            .filter(Loan.book_id == book_id, Loan.status.in_(["BORROWED", "OVERDUE"]))
            .count()
        )
        if book_in.total_copies < active_loans_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reduce total copies below active borrowed count ({active_loans_count})",
            )
        copy_diff = book_in.total_copies - book.total_copies
        book.total_copies = book_in.total_copies
        book.available_copies = max(0, book.available_copies + copy_diff)

    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with ID '{book_id}' not found",
        )

    active_loans = (
        db.query(Loan)
        .filter(Loan.book_id == book_id, Loan.status.in_(["BORROWED", "OVERDUE"]))
        .first()
    )
    if active_loans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete book with active loans",
        )

    db.delete(book)
    db.commit()
    return None
