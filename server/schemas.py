from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from server.models import UserRole, LoanStatus, FineStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.MEMBER


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BookBase(BaseModel):
    isbn: str
    title: str
    author: str
    genre: str
    total_copies: int = Field(ge=1)


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    genre: Optional[str] = None
    total_copies: Optional[int] = Field(default=None, ge=1)


class BookResponse(BookBase):
    id: str
    available_copies: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BookListResponse(BaseModel):
    items: List[BookResponse]
    total: int
    skip: int
    limit: int


class CheckoutRequest(BaseModel):
    book_id: str


class FineResponse(BaseModel):
    id: str
    loan_id: str
    user_id: str
    amount: float
    status: FineStatus
    created_at: datetime

    class Config:
        from_attributes = True


class LoanResponse(BaseModel):
    id: str
    user_id: str
    book_id: str
    checkout_date: datetime
    due_date: datetime
    return_date: Optional[datetime] = None
    is_renewed: bool
    status: LoanStatus
    created_at: datetime
    book: Optional[BookResponse] = None
    fine: Optional[FineResponse] = None

    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    active_loans_count: int = 0
    total_fines_unpaid: float = 0.0


class MostPopularGenreItem(BaseModel):
    genre: str
    checkout_count: int


class TurnAroundRates(BaseModel):
    average_turnaround_days: float
    total_returned_loans: int


class AdminAnalyticsResponse(BaseModel):
    most_popular_genres: List[MostPopularGenreItem]
    turn_around_rates: TurnAroundRates
    active_members_count: int
    total_fines_collected: float
