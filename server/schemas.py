
from pydantic import BaseModel, UUID4
import datetime
from typing import Optional, List

# Book Schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    publication_year: int
    genre: Optional[str] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    book_id: UUID4
    is_available: bool

    class Config:
        from_attributes = True

# Patron Schemas
class PatronBase(BaseModel):
    name: str
    contact_info: str

class PatronCreate(PatronBase):
    pass

class Patron(PatronBase):
    patron_id: UUID4

    class Config:
        from_attributes = True

# Loan Schemas
class LoanBase(BaseModel):
    book_id: UUID4
    patron_id: UUID4

class LoanCreate(LoanBase):
    pass

class Loan(LoanBase):
    loan_id: UUID4
    loan_date: datetime.datetime
    return_date: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# Search Schemas
class SearchResult(Book):
    pass
