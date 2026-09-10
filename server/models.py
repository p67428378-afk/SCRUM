import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(20), nullable=False, default="PATRON")  # PATRON, STAFF, ADMIN
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    member = relationship(
        "Member", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Member(Base):
    __tablename__ = "members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    membership_tier = Column(
        String(20), nullable=False, default="STANDARD"
    )  # STANDARD, PREMIUM
    status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, SUSPENDED
    unpaid_fines = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="member")
    loans = relationship("Loan", back_populates="member", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    isbn = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    total_copies = Column(
        Integer, CheckConstraint("total_copies >= 0"), nullable=False, default=1
    )
    available_copies = Column(
        Integer, CheckConstraint("available_copies >= 0"), nullable=False, default=1
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    loans = relationship("Loan", back_populates="book")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), ForeignKey("books.id"), nullable=False, index=True)
    member_id = Column(String(36), ForeignKey("members.id"), nullable=False, index=True)
    checkout_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(
        String(20), nullable=False, default="BORROWED", index=True
    )  # BORROWED, RETURNED, OVERDUE
    fine_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    book = relationship("Book", back_populates="loans")
    member = relationship("Member", back_populates="loans")
