import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import Book, Category, User
from server.schemas import (
    BookResponse,
    BookCreate,
    BookUpdate,
    BookListResponse,
    CategoryResponse,
    CategoryCreate,
)
from server.auth import get_current_admin_user

router = APIRouter()


# ==========================
# Category Endpoints
# ==========================


@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    return categories


@router.post(
    "/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED
)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    existing = db.query(Category).filter(Category.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists"
        )
    category = Category(
        id=str(uuid.uuid4()),
        name=category_in.name,
        description=category_in.description,
        created_at=datetime.now(timezone.utc),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ==========================
# Book Endpoints
# ==========================


@router.get("/books", response_model=BookListResponse)
def get_books(
    query: Optional[str] = Query(
        None, description="Search keyword in title, author, or ISBN"
    ),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: Optional[str] = Query(
        None, description="Sort by: price_asc, price_desc, rating, title, newest"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Book)

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.isbn.ilike(search_pattern),
            )
        )

    if category_id:
        q = q.filter(Book.category_id == category_id)

    if min_price is not None:
        q = q.filter(Book.price >= min_price)

    if max_price is not None:
        q = q.filter(Book.price <= max_price)

    if sort_by == "price_asc":
        q = q.order_by(Book.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(Book.price.desc())
    elif sort_by == "rating":
        q = q.order_by(Book.rating.desc())
    elif sort_by == "title":
        q = q.order_by(Book.title.asc())
    elif sort_by == "newest":
        q = q.order_by(Book.created_at.desc())
    else:
        q = q.order_by(Book.title.asc())

    total = q.count()
    items = q.offset(skip).limit(limit).all()

    return BookListResponse(
        items=[BookResponse.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: str, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )
    return BookResponse.model_validate(book)


@router.post("/books", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_in: BookCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    # Verify category exists
    cat = db.query(Category).filter(Category.id == book_in.category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id"
        )

    # Check ISBN uniqueness
    existing_isbn = db.query(Book).filter(Book.isbn == book_in.isbn).first()
    if existing_isbn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A book with this ISBN already exists",
        )

    now = datetime.now(timezone.utc)
    book = Book(
        id=str(uuid.uuid4()),
        title=book_in.title,
        author=book_in.author,
        isbn=book_in.isbn,
        category_id=book_in.category_id,
        price=book_in.price,
        stock_quantity=book_in.stock_quantity,
        rating=book_in.rating,
        summary=book_in.summary,
        cover_image=book_in.cover_image,
        created_at=now,
        updated_at=now,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookResponse.model_validate(book)


@router.put("/books/{book_id}", response_model=BookResponse)
def update_book(
    book_id: str,
    book_in: BookUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )

    if book_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == book_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id"
            )
        book.category_id = book_in.category_id

    if book_in.isbn is not None and book_in.isbn != book.isbn:
        existing = db.query(Book).filter(Book.isbn == book_in.isbn).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A book with this ISBN already exists",
            )
        book.isbn = book_in.isbn

    if book_in.title is not None:
        book.title = book_in.title
    if book_in.author is not None:
        book.author = book_in.author
    if book_in.price is not None:
        book.price = book_in.price
    if book_in.stock_quantity is not None:
        book.stock_quantity = book_in.stock_quantity
    if book_in.rating is not None:
        book.rating = book_in.rating
    if book_in.summary is not None:
        book.summary = book_in.summary
    if book_in.cover_image is not None:
        book.cover_image = book_in.cover_image

    book.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(book)
    return BookResponse.model_validate(book)


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Book not found"
        )
    db.delete(book)
    db.commit()
    return None
