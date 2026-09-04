from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server import crud, schemas

router = APIRouter(prefix="/books", tags=["books"])


@router.post(
    "",
    response_model=schemas.BookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new book record",
)
def create_book(
    book_in: schemas.BookCreate,
    db: Session = Depends(get_db),
):
    existing_book = crud.get_book_by_isbn(db, isbn=book_in.isbn)
    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book with this ISBN already exists",
        )
    return crud.create_book(db, book_in)


@router.get(
    "",
    response_model=schemas.BookPaginatedResponse,
    summary="List & search books with filters and pagination",
)
def list_books(
    query: Optional[str] = Query(None, description="Search title or author keywords"),
    category: Optional[str] = Query(None, description="Category filter"),
    in_stock: Optional[bool] = Query(None, description="Filter for in-stock books"),
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    items, total = crud.get_books(
        db,
        query=query,
        category=category,
        in_stock=in_stock,
        skip=skip,
        limit=limit,
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get(
    "/{id}",
    response_model=schemas.BookResponse,
    summary="Get book details by UUID",
)
def get_book(
    id: str,
    db: Session = Depends(get_db),
):
    book = crud.get_book_by_id(db, book_id=id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return book


@router.put(
    "/{id}",
    response_model=schemas.BookResponse,
    summary="Update existing book record",
)
def update_book(
    id: str,
    book_in: schemas.BookUpdate,
    db: Session = Depends(get_db),
):
    db_book = crud.get_book_by_id(db, book_id=id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    if book_in.isbn and book_in.isbn != db_book.isbn:
        existing_isbn = crud.get_book_by_isbn(db, isbn=book_in.isbn)
        if existing_isbn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book with this ISBN already exists",
            )

    return crud.update_book(db, db_book=db_book, book_in=book_in)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete book from inventory",
)
def delete_book(
    id: str,
    db: Session = Depends(get_db),
):
    db_book = crud.get_book_by_id(db, book_id=id)
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    crud.delete_book(db, db_book=db_book)
    return None
