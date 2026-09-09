from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime


class DrugBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    generic_name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    manufacturer: str = Field(..., min_length=1, max_length=255)
    batch_number: str = Field(..., min_length=1, max_length=100)
    stock_quantity: int = Field(..., ge=0)
    expiration_date: date
    category: str = Field(..., min_length=1, max_length=100)
    unit_price: float = Field(..., gt=0)

    @field_validator("unit_price")
    def validate_unit_price(cls, v):
        if v <= 0:
            raise ValueError("unit_price must be positive")
        return round(float(v), 2)


class DrugCreate(DrugBase):
    pass


class DrugUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    generic_name: Optional[str] = Field(None, min_length=1, max_length=255)
    dosage: Optional[str] = Field(None, min_length=1, max_length=100)
    manufacturer: Optional[str] = Field(None, min_length=1, max_length=255)
    batch_number: Optional[str] = Field(None, min_length=1, max_length=100)
    stock_quantity: Optional[int] = Field(None, ge=0)
    expiration_date: Optional[date] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    unit_price: Optional[float] = Field(None, gt=0)

    @field_validator("unit_price")
    def validate_unit_price(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError("unit_price must be positive")
            return round(float(v), 2)
        return v


class DrugResponse(DrugBase):
    id: str
    is_low_stock: bool
    is_near_expiry: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DrugListResponse(BaseModel):
    items: List[DrugResponse]
    total: int
    low_stock_count: int
    near_expiry_count: int
