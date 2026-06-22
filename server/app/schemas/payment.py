"""
Module: schemas.payment
Purpose: Pydantic schemas for Bill and Payment
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class BillResponse(BaseModel):
    id: str
    resident_id: str
    amount: Decimal
    due_date: date
    status: str
    description: str

    class Config:
        from_attributes = True


class CardDetails(BaseModel):
    card_number: str
    cvv: str
    expiry: str


class PaymentCreate(BaseModel):
    bill_id: str
    amount_paid: Decimal
    payment_method: str
    card_details: Optional[CardDetails] = None


class PaymentResponse(BaseModel):
    id: str
    bill_id: str
    amount_paid: Decimal
    transaction_id: str
    payment_date: datetime
    status: str

    class Config:
        from_attributes = True
