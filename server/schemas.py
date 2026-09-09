from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# Tea Schemas
class TeaBase(BaseModel):
    name: str
    category: str
    current_stock_grams: float = Field(..., ge=0)
    min_threshold_grams: float = Field(default=500.0, ge=0)
    unit_price: float = Field(..., ge=0)
    supplier_name: Optional[str] = None


class TeaCreate(TeaBase):
    pass


class Tea(TeaBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeaAlert(BaseModel):
    id: str
    name: str
    category: str
    current_stock_grams: float
    min_threshold_grams: float
    unit_price: float
    supplier_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Inventory Schemas
class InventoryAdjust(BaseModel):
    tea_id: str
    change_grams: float
    reason: str = Field(..., description="RESTOCK, AUDIT, SPOILAGE, ORDER_DEDUCTION")


class InventoryTransaction(BaseModel):
    id: str
    tea_id: str
    change_grams: float
    reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Order Item Schemas
class OrderItemCreate(BaseModel):
    tea_id: str
    quantity: int = Field(..., ge=1)
    sweetness_level: str = Field(..., description="0%, 25%, 50%, 75%, 100%")
    temperature: str = Field(..., description="Hot, Warm, Iced")
    milk_option: str = Field(..., description="Whole, Oat, Almond, None")
    add_ons: List[str] = Field(default_factory=list)


class OrderItem(BaseModel):
    id: str
    tea_id: str
    quantity: int
    sweetness_level: str
    temperature: str
    milk_option: str
    add_ons: List[str]
    item_price: float

    model_config = ConfigDict(from_attributes=True)


# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class Order(BaseModel):
    id: str
    order_number: str
    total_amount: float
    status: str
    items: List[OrderItem]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Recipe Schemas
class RecipeCreate(BaseModel):
    tea_id: str
    steep_temperature_c: float
    steep_time_seconds: int
    leaf_water_ratio_g_per_ml: str
    instructions: Optional[str] = None


class Recipe(RecipeCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Quality Log Schemas
class QualityLogCreate(BaseModel):
    recipe_id: str
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None


class QualityLog(QualityLogCreate):
    id: str
    brewed_at: datetime

    model_config = ConfigDict(from_attributes=True)
