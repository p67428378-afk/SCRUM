from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models import Book
from server.schemas import BookCreate, BookUpdate


def get_book_by_id(db: Session, book_id: str) -> Optional[Book]:
    return db.query(Book).filter(Book.id == book_id).first()


def get_book_by_isbn(db: Session, isbn: str) -> Optional[Book]:
    return db.query(Book).filter(Book.isbn == isbn).first()


def get_books(
    db: Session,
    query: Optional[str] = None,
    category: Optional[str] = None,
    in_stock: Optional[bool] = None,
    skip: int = 0,
    limit: int = 10,
) -> Tuple[List[Book], int]:
    db_query = db.query(Book)

    if query and query.strip():
        search_pattern = f"%{query.strip()}%"
        db_query = db_query.filter(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
            )
        )

    if category and category.strip():
        db_query = db_query.filter(Book.category.ilike(category.strip()))

    if in_stock is True:
        db_query = db_query.filter(Book.stock_quantity > 0)
    elif in_stock is False:
        db_query = db_query.filter(Book.stock_quantity == 0)

    total = db_query.count()
    items = db_query.offset(skip).limit(limit).all()
    return items, total


def create_book(db: Session, book_in: BookCreate) -> Book:
    db_book = Book(
        title=book_in.title,
        author=book_in.author,
        isbn=book_in.isbn,
        category=book_in.category,
        publication_year=book_in.publication_year,
        price=book_in.price,
        stock_quantity=book_in.stock_quantity,
        description=book_in.description,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


def update_book(db: Session, db_book: Book, book_in: BookUpdate) -> Book:
    update_data = book_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)

    db_book.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_book)
    return db_book


def delete_book(db: Session, db_book: Book) -> None:
    db.delete(db_book)
    db.commit()
