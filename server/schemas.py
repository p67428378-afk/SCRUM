from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    publication_year: int
    price: float = Field(..., ge=0, description="Price must be non-negative")
    stock_quantity: int = Field(
        ..., ge=0, description="Stock quantity must be non-negative"
    )
    description: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category: Optional[str] = None
    publication_year: Optional[int] = None
    price: Optional[float] = Field(None, ge=0, description="Price must be non-negative")
    stock_quantity: Optional[int] = Field(
        None, ge=0, description="Stock quantity must be non-negative"
    )
    description: Optional[str] = None


class BookResponse(BookBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookPaginatedResponse(BaseModel):
    items: List[BookResponse]
    total: int
    skip: int
    limit: int
