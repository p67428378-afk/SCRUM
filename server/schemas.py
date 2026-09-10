from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Token & Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: str
    member_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "PATRON"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime


# Member Schemas
class MemberCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    password: Optional[str] = "testpassword"
    membership_tier: Optional[str] = "STANDARD"


class MemberUpdate(BaseModel):
    membership_tier: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    membership_tier: str
    status: str
    unpaid_fines: float
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None


# Book Schemas
class BookCreate(BaseModel):
    isbn: str = Field(..., min_length=5, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    total_copies: int = Field(..., ge=0)


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    total_copies: Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    isbn: str
    title: str
    author: str
    category: str
    total_copies: int
    available_copies: int
    created_at: datetime
    updated_at: datetime


# Loan Schemas
class LoanCheckoutRequest(BaseModel):
    member_id: str
    book_id: str


class LoanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    book_id: str
    member_id: str
    checkout_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    fine_amount: float
    created_at: datetime
    updated_at: datetime
    book: Optional[BookResponse] = None


# Fine Schemas
class FinePaymentRequest(BaseModel):
    amount_paid: float = Field(..., gt=0)


class FinePaymentResponse(BaseModel):
    message: str
    loan_id: Optional[str] = None
    member_id: str
    amount_paid: float
    remaining_unpaid_fines: float
    member_status: str


class MessageResponse(BaseModel):
    message: str
