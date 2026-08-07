from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from server.models import UserRole, UserStatus, BookStatus, FineStatus


# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.PATRON


# --- User / Patron Schemas ---
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.PATRON
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    password: str


class PatronCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    status: Optional[UserStatus] = UserStatus.ACTIVE


class PatronUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[UserStatus] = None


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatronDetailResponse(UserResponse):
    active_loans_count: int
    unpaid_fines_balance: float


# --- Book Schemas ---
class BookBase(BaseModel):
    title: str
    author: str
    category: str
    isbn: str
    status: Optional[BookStatus] = BookStatus.AVAILABLE


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    isbn: Optional[str] = None
    status: Optional[BookStatus] = None


class BookResponse(BookBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Loan Schemas ---
class CheckoutRequest(BaseModel):
    book_id: str


class LoanResponse(BaseModel):
    id: str
    patron_id: str
    book_id: str
    borrow_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    book_title: Optional[str] = None
    author: Optional[str] = None

    class Config:
        from_attributes = True


class LoanReturnResponse(BaseModel):
    loan: LoanResponse
    fine_assessed: float
    message: str


# --- Fine Schemas ---
class FineCreate(BaseModel):
    loan_id: str
    patron_id: str
    amount: float
    status: Optional[FineStatus] = FineStatus.UNPAID


class FineUpdate(BaseModel):
    amount: Optional[float] = None
    status: Optional[FineStatus] = None


class FineResponse(BaseModel):
    id: str
    loan_id: str
    patron_id: str
    amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PayFineResponse(BaseModel):
    fine: FineResponse
    remaining_balance: float
    message: str
