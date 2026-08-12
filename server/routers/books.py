from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server import models, schemas
from server.database import get_db
from server.dependencies import require_role

router = APIRouter(prefix="/api/v1/books", tags=["books"])


@router.get("", response_model=schemas.BookListResponse)
@router.get("/", response_model=schemas.BookListResponse)
def list_books(
    query: Optional[str] = Query(
        None, description="Fuzzy search query for title, author, genre, or ISBN"
    ),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    db_query = db.query(models.Book)

    if genre:
        db_query = db_query.filter(models.Book.genre.ilike(f"%{genre}%"))

    if query:
        search_pattern = f"%{query}%"
        db_query = db_query.filter(
            or_(
                models.Book.title.ilike(search_pattern),
                models.Book.author.ilike(search_pattern),
                models.Book.genre.ilike(search_pattern),
                models.Book.isbn.ilike(search_pattern),
            )
        )

    total = db_query.count()
    books = db_query.offset(skip).limit(limit).all()

    return schemas.BookListResponse(
        items=books,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post(
    "", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED
)
@router.post(
    "/", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED
)
def create_book(
    book_in: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    existing_book = (
        db.query(models.Book).filter(models.Book.isbn == book_in.isbn).first()
    )
    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book with this ISBN already exists",
        )

    book = models.Book(
        isbn=book_in.isbn,
        title=book_in.title,
        author=book_in.author,
        genre=book_in.genre,
        total_copies=book_in.total_copies,
        available_copies=book_in.total_copies,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return book


@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: str,
    book_in: schemas.BookUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    if book_in.title is not None:
        book.title = book_in.title
    if book_in.author is not None:
        book.author = book_in.author
    if book_in.genre is not None:
        book.genre = book_in.genre
    if book_in.total_copies is not None:
        diff = book_in.total_copies - book.total_copies
        new_available = book.available_copies + diff
        if new_available < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reduce total copies below currently borrowed count",
            )
        book.total_copies = book_in.total_copies
        book.available_copies = new_available

    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}")
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    # Check for active loans
    active_loans = (
        db.query(models.Loan)
        .filter(
            models.Loan.book_id == book_id,
            models.Loan.status == models.LoanStatus.ACTIVE,
        )
        .count()
    )
    if active_loans > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete book with active loans",
        )

    db.delete(book)
    db.commit()
    return {"detail": "Book deleted successfully"}
