
from sqlalchemy.orm import Session
from . import models, schemas
from uuid import UUID
import datetime

# Book CRUD
def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def get_books(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Book).offset(skip).limit(limit).all()

def get_book(db: Session, book_id: UUID):
    return db.query(models.Book).filter(models.Book.book_id == book_id).first()

# Patron CRUD
def create_patron(db: Session, patron: schemas.PatronCreate):
    db_patron = models.Patron(**patron.model_dump())
    db.add(db_patron)
    db.commit()
    db.refresh(db_patron)
    return db_patron

def get_patrons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Patron).offset(skip).limit(limit).all()

# Loan CRUD
def create_loan(db: Session, loan: schemas.LoanCreate):
    db_loan = models.Loan(**loan.model_dump())
    db_book = get_book(db, loan.book_id)
    if db_book:
        db_book.is_available = False
        db.add(db_book)
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan

def return_loan(db: Session, loan_id: UUID):
    db_loan = db.query(models.Loan).filter(models.Loan.loan_id == loan_id).first()
    if db_loan:
        db_loan.return_date = datetime.datetime.utcnow()
        db_book = get_book(db, db_loan.book_id)
        if db_book:
            db_book.is_available = True
            db.add(db_book)
        db.add(db_loan)
        db.commit()
        db.refresh(db_loan)
    return db_loan

def get_loan(db: Session, loan_id: UUID):
    return db.query(models.Loan).filter(models.Loan.loan_id == loan_id).first()

# Search CRUD
def search_books(db: Session, query: str, type: str):
    if type == "title":
        return db.query(models.Book).filter(models.Book.title.ilike(f"%{query}%")).all()
    elif type == "author":
        return db.query(models.Book).filter(models.Book.author.ilike(f"%{query}%")).all()
    elif type == "isbn":
        return db.query(models.Book).filter(models.Book.isbn.ilike(f"%{query}%")).all()
    return []
