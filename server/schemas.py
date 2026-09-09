from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ----------------------
# Error Schemas
# ----------------------
class ErrorResponse(BaseModel):
    detail: str


# ----------------------
# User Schemas
# ----------------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "patron"  # "patron" or "admin"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(patron|admin)$")
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------------
# Book Schemas
# ----------------------
class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    isbn: str = Field(..., min_length=1, max_length=20)
    genre: str = Field(..., min_length=1, max_length=100)
    total_copies: int = Field(default=1, ge=1)
    available_copies: Optional[int] = Field(default=None, ge=0)


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    isbn: Optional[str] = Field(None, min_length=1, max_length=20)
    genre: Optional[str] = Field(None, min_length=1, max_length=100)
    total_copies: Optional[int] = Field(None, ge=1)
    available_copies: Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    isbn: str
    genre: str
    total_copies: int
    available_copies: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ----------------------
# Loan Schemas
# ----------------------
class LoanCheckoutRequest(BaseModel):
    book_id: str
    patron_id: Optional[str] = None


class LoanResponse(BaseModel):
    id: str
    book_id: str
    patron_id: str
    checkout_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoanWithDetailsResponse(LoanResponse):
    book: Optional[BookResponse] = None
    patron: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
