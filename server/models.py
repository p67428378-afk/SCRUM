
import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.database import Base
import datetime

def default_uuid():
    return str(uuid.uuid4())

class Book(Base):
    __tablename__ = "books"

    book_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, nullable=False, unique=True)
    publication_year = Column(Integer, nullable=False)
    genre = Column(String, nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    loans = relationship("Loan", back_populates="book")

class Patron(Base):
    __tablename__ = "patrons"

    patron_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    contact_info = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    loans = relationship("Loan", back_populates="patron")

class Loan(Base):
    __tablename__ = "loans"

    loan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.book_id"))
    patron_id = Column(UUID(as_uuid=True), ForeignKey("patrons.patron_id"))
    loan_date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="loans")
    patron = relationship("Patron", back_populates="loans")
