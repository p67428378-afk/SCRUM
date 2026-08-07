import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.database import get_db
from server.models import Book, BookStatus, User
from server.schemas import BookCreate, BookUpdate, BookResponse
from server.dependencies import require_librarian

router = APIRouter(prefix="/books", tags=["books"])


@router.get("", response_model=List[BookResponse])
def search_books(
    query: Optional[str] = Query(None, description="Search by title, author, or ISBN"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(
        None, description="Filter by status (AVAILABLE, BORROWED, MAINTENANCE)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    db_query = db.query(Book)
    if query:
        search_pattern = f"%{query}%"
        db_query = db_query.filter(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.isbn.ilike(search_pattern),
            )
        )
    if category:
        db_query = db_query.filter(Book.category.ilike(category))
    if status:
        db_query = db_query.filter(Book.status == status.upper())

    books = db_query.offset(skip).limit(limit).all()
    return books


@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )
    return book


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    existing = db.query(Book).filter(Book.isbn == book_in.isbn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A book with this ISBN already exists",
        )

    status_val = book_in.status.value if book_in.status else BookStatus.AVAILABLE.value

    book = Book(
        id=str(uuid.uuid4()),
        title=book_in.title,
        author=book_in.author,
        category=book_in.category,
        isbn=book_in.isbn,
        status=status_val,
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
    admin: User = Depends(require_librarian),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    if book_in.title is not None:
        book.title = book_in.title
    if book_in.author is not None:
        book.author = book_in.author
    if book_in.category is not None:
        book.category = book_in.category
    if book_in.isbn is not None and book_in.isbn != book.isbn:
        existing = db.query(Book).filter(Book.isbn == book_in.isbn).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="ISBN already in use"
            )
        book.isbn = book_in.isbn
    if book_in.status is not None:
        book.status = book_in.status.value

    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_librarian),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    db.delete(book)
    db.commit()
    return None
