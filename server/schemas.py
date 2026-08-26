from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["income", "expense", "both"]
    is_predefined: bool = False


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: Literal["income", "expense"]
    date: date
    description: str = Field(..., min_length=1, max_length=255)
    category_id: str
    payment_method: Optional[str] = Field(None, max_length=50)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[Literal["income", "expense"]] = None
    date: Optional[date] = None
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    category_id: Optional[str] = None
    payment_method: Optional[str] = Field(None, max_length=50)


class TransactionResponse(BaseModel):
    id: str
    amount: float
    type: str
    date: date
    description: str
    category_id: str
    payment_method: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryBreakdownItem(BaseModel):
    category_id: str
    category_name: str
    amount: float
    percentage: float


class SummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    category_breakdown: List[CategoryBreakdownItem]
