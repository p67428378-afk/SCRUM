import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


class UserRole(str, Enum):
    PATRON = "PATRON"
    LIBRARIAN = "LIBRARIAN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"


class BookStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BORROWED = "BORROWED"
    MAINTENANCE = "MAINTENANCE"


class LoanStatus(str, Enum):
    BORROWED = "BORROWED"
    OVERDUE = "OVERDUE"
    RETURNED = "RETURNED"


class FineStatus(str, Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.PATRON.value, nullable=False)
    status = Column(String(50), default=UserStatus.ACTIVE.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    loans = relationship("Loan", back_populates="patron")
    fines = relationship("Fine", back_populates="patron")


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    isbn = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(50), default=BookStatus.AVAILABLE.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    loans = relationship("Loan", back_populates="book")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patron_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False, index=True)
    borrow_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(String(50), default=LoanStatus.BORROWED.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    patron = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")
    fine = relationship("Fine", back_populates="loan", uselist=False)


class Fine(Base):
    __tablename__ = "fines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False, index=True)
    patron_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default=FineStatus.UNPAID.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    loan = relationship("Loan", back_populates="fine")
    patron = relationship("User", back_populates="fines")
