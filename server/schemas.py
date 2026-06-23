from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class JewelryItemBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    material: Optional[str] = Field(None, max_length=100)
    carat_weight: Optional[Decimal] = Field(None, ge=0)
    gemstone_type: Optional[str] = Field(None, max_length=100)
    price: Decimal = Field(..., ge=0)
    quantity: int = Field(..., ge=0)


class JewelryItemCreate(JewelryItemBase):
    pass


class JewelryItemUpdate(BaseModel):
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    material: Optional[str] = Field(None, max_length=100)
    carat_weight: Optional[Decimal] = Field(None, ge=0)
    gemstone_type: Optional[str] = Field(None, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)


class JewelryItemResponse(BaseModel):
    id: str
    sku: str
    name: str
    description: Optional[str] = None
    material: Optional[str] = None
    carat_weight: Optional[float] = None
    gemstone_type: Optional[str] = None
    price: float
    quantity: int
    created_at: datetime
    updated_at: datetime
    low_stock: bool = False

    @model_validator(mode="before")
    @classmethod
    def set_low_stock(cls, data):
        # If data is an ORM model or dict, we can check quantity
        if hasattr(data, "quantity"):
            qty = data.quantity
        elif isinstance(data, dict):
            qty = data.get("quantity", 0)
        else:
            qty = 0

        # We can set low_stock dynamically
        if isinstance(data, dict):
            data["low_stock"] = qty < 5
        else:
            # For ORM objects, we can set it as an attribute or handle it in the validator
            setattr(data, "low_stock", qty < 5)
        return data

    model_config = {"from_attributes": True}


class PaginatedJewelryItems(BaseModel):
    items: list[JewelryItemResponse]
    total: int
    skip: int
    limit: int
