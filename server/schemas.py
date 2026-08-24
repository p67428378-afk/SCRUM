from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal


# User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# Item Schemas
class ItemCreate(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    unit_price: Decimal = Field(..., ge=0)
    cost_price: Decimal = Field(..., ge=0)
    unit_of_measure: str = Field(..., min_length=1, max_length=50)
    supplier_name: str = Field(..., min_length=1, max_length=255)
    initial_stock: Decimal = Field(default=Decimal("0.0"), ge=0)
    reorder_threshold: Decimal = Field(default=Decimal("0.0"), ge=0)


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    cost_price: Optional[Decimal] = Field(None, ge=0)
    unit_of_measure: Optional[str] = Field(None, min_length=1, max_length=50)
    supplier_name: Optional[str] = Field(None, min_length=1, max_length=255)


class ItemResponse(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    unit_price: Decimal
    cost_price: Decimal
    unit_of_measure: str
    supplier_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Inventory Schemas
class InventoryUpdate(BaseModel):
    current_stock: Decimal = Field(..., ge=0)
    reorder_threshold: Decimal = Field(..., ge=0)


class InventoryResponse(BaseModel):
    item_id: str
    current_stock: Decimal
    reorder_threshold: Decimal
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LowStockResponse(BaseModel):
    item_id: str
    sku: str
    name: str
    category: str
    current_stock: Decimal
    reorder_threshold: Decimal
    unit_of_measure: str

    model_config = ConfigDict(from_attributes=True)


# Stock Adjustment Schemas
class StockAdjustmentCreate(BaseModel):
    adjustment_type: str = Field(..., pattern="^(Correction|Damage|Restock)$")
    quantity_changed: Decimal
    reason: str = Field(..., min_length=1)

    @field_validator("quantity_changed")
    @classmethod
    def validate_quantity(cls, v: Decimal) -> Decimal:
        if v == Decimal("0.0"):
            raise ValueError("Adjustment quantity must not be 0")
        return v


class StockAdjustmentResponse(BaseModel):
    adjustment_id: str
    item_id: str
    new_stock: Decimal
    adjustment_type: str
    quantity_changed: Decimal
    reason: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
