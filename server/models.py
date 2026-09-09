import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from server.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patron")  # "patron" or "admin"
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    loans = relationship("Loan", back_populates="patron", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    genre = Column(String(100), nullable=False, index=True)
    total_copies = Column(Integer, nullable=False, default=1)
    available_copies = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    __table_args__ = (
        CheckConstraint(
            "available_copies >= 0", name="check_available_copies_non_negative"
        ),
        CheckConstraint(
            "available_copies <= total_copies", name="check_available_copies_lte_total"
        ),
    )

    loans = relationship("Loan", back_populates="book", cascade="all, delete-orphan")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False, index=True)
    patron_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    checkout_date = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    due_date = Column(DateTime(timezone=True), nullable=False)
    return_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        String(50), nullable=False, default="active"
    )  # "active", "returned", "overdue"
    created_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=get_utc_now,
        onupdate=get_utc_now,
    )

    book = relationship("Book", back_populates="loans")
    patron = relationship("User", back_populates="loans")
