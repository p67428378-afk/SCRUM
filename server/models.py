import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from server.database import Base


class UserRole(str, enum.Enum):
    LIBRARIAN = "Librarian"
    MEMBER = "Member"


class LoanStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RETURNED = "RETURNED"


class FineStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(UserRole, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.MEMBER,
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    fines = relationship("Fine", back_populates="user", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    isbn = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), index=True, nullable=False)
    genre = Column(String(100), nullable=False)
    total_copies = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    loans = relationship("Loan", back_populates="book", cascade="all, delete-orphan")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False)
    checkout_date = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    return_date = Column(DateTime(timezone=True), nullable=True)
    is_renewed = Column(Boolean, default=False, nullable=False)
    status = Column(
        SQLEnum(LoanStatus, values_callable=lambda x: [e.value for e in x]),
        default=LoanStatus.ACTIVE,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")
    fines = relationship("Fine", back_populates="loan", cascade="all, delete-orphan")


class Fine(Base):
    __tablename__ = "fines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(
        SQLEnum(FineStatus, values_callable=lambda x: [e.value for e in x]),
        default=FineStatus.UNPAID,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    loan = relationship("Loan", back_populates="fines")
    user = relationship("User", back_populates="fines")
