from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User
from server.schemas import (
    BookCreate,
    BookUpdate,
    BookResponse,
    ErrorResponse,
)
from server.auth import (
    get_current_admin_user,
)
from server import crud

router = APIRouter(prefix="/api/v1", tags=["books"])


@router.get(
    "/books",
    response_model=List[BookResponse],
    summary="Search and filter books catalog",
)
def get_books(
    q: Optional[str] = Query(
        None, description="Search keyword in title, author, genre, or ISBN"
    ),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    status: Optional[str] = Query(
        None, description="Filter by availability status ('available', 'checked_out')"
    ),
    isbn: Optional[str] = Query(None, description="Filter by ISBN"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max number of items to return"),
    db: Session = Depends(get_db),
):
    books = crud.get_books(
        db,
        q=q,
        genre=genre,
        status_filter=status,
        isbn=isbn,
        skip=skip,
        limit=limit,
    )
    return books


@router.post(
    "/books",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Add a new book to the catalog",
    responses={
        409: {"model": ErrorResponse, "description": "Duplicate ISBN"},
        403: {"model": ErrorResponse, "description": "Admin access required"},
    },
)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    book = crud.create_book(db, book_in)
    return book


@router.get(
    "/books/{book_id}",
    response_model=BookResponse,
    summary="Retrieve detailed information for a specific book",
    responses={404: {"model": ErrorResponse, "description": "Book not found"}},
)
def get_book_details(book_id: str, db: Session = Depends(get_db)):
    book = crud.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return book


@router.put(
    "/books/{book_id}",
    response_model=BookResponse,
    summary="[Admin] Update book details",
    responses={
        404: {"model": ErrorResponse, "description": "Book not found"},
        403: {"model": ErrorResponse, "description": "Admin access required"},
    },
)
def update_book(
    book_id: str,
    book_in: BookUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    book = crud.update_book(db, book_id, book_in)
    return book


@router.delete(
    "/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete a book from catalog",
    responses={
        404: {"model": ErrorResponse, "description": "Book not found"},
        403: {"model": ErrorResponse, "description": "Admin access required"},
    },
)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    crud.delete_book(db, book_id)
    return None
