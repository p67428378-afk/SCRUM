from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import date, datetime


# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str

    class Config:
        orm_mode = True
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# --- Funding Account Schemas ---
class FundingAccountCreate(BaseModel):
    account_number: str
    account_provider: str
    account_type: str  # CHECKING or SAVINGS
    routing_number: str

    @validator("account_type")
    def validate_account_type(cls, v):
        if v not in ["CHECKING", "SAVINGS"]:
            raise ValueError("account_type must be CHECKING or SAVINGS")
        return v


class FundingAccountResponse(BaseModel):
    id: str
    account_type: str
    account_provider: str
    account_number_last4: str
    balance: float
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True


# --- Payee Schemas ---
class PayeeResponse(BaseModel):
    id: str
    name: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True


# --- Payment Split Schemas ---
class PaymentSplitCreate(BaseModel):
    funding_account_id: str
    split_type: str  # PERCENTAGE or FIXED
    split_value: float

    @validator("split_type")
    def validate_split_type(cls, v):
        if v not in ["PERCENTAGE", "FIXED"]:
            raise ValueError("split_type must be PERCENTAGE or FIXED")
        return v


class PaymentSplitResponse(BaseModel):
    id: str
    funding_account_id: str
    split_type: str
    split_value: float

    class Config:
        orm_mode = True
        from_attributes = True


# --- Recurring Payment Schemas ---
class RecurringPaymentCreate(BaseModel):
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    frequency: str  # WEEKLY, MONTHLY, ANNUALLY
    payee_id: str
    splits: List[PaymentSplitCreate]
    start_date: date

    @validator("frequency")
    def validate_frequency(cls, v):
        if v not in ["WEEKLY", "MONTHLY", "ANNUALLY"]:
            raise ValueError("frequency must be WEEKLY, MONTHLY, or ANNUALLY")
        return v


class RecurringPaymentUpdate(BaseModel):
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    frequency: str
    splits: List[PaymentSplitCreate]
    start_date: date

    @validator("frequency")
    def validate_frequency(cls, v):
        if v not in ["WEEKLY", "MONTHLY", "ANNUALLY"]:
            raise ValueError("frequency must be WEEKLY, MONTHLY, or ANNUALLY")
        return v


class RecurringPaymentResponse(BaseModel):
    id: str
    payee_id: str
    description: Optional[str]
    amount: float
    currency: str
    frequency: str
    start_date: date
    next_payment_date: date
    is_active: bool
    splits: List[PaymentSplitResponse]

    class Config:
        orm_mode = True
        from_attributes = True


class PayeeNested(BaseModel):
    id: str
    name: str

    class Config:
        orm_mode = True
        from_attributes = True


class RecurringPaymentListResponse(BaseModel):
    id: str
    payee: PayeeNested
    description: Optional[str]
    amount: float
    currency: str
    frequency: str
    start_date: date
    next_payment_date: date
    is_active: bool
    splits: List[PaymentSplitResponse]

    class Config:
        orm_mode = True
        from_attributes = True


# --- Transaction Schemas ---
class PaymentTransactionResponse(BaseModel):
    id: str
    recurring_payment_id: str
    amount: float
    status: str
    gateway_transaction_id: Optional[str]
    processed_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
