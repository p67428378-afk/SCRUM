from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: Optional[str] = "staff"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- Ingredient Schemas ---
class IngredientBase(BaseModel):
    name: str
    unit: str
    stock_quantity: float = Field(default=0.0, ge=0.0)
    reorder_threshold: float = Field(default=10.0, ge=0.0)


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    stock_quantity: Optional[float] = Field(default=None, ge=0.0)
    reorder_threshold: Optional[float] = Field(default=None, ge=0.0)


class StockAdjustment(BaseModel):
    quantity_change: float = Field(
        ..., description="Positive for restock, negative for reduction"
    )
    reason: Optional[str] = "Manual stock adjustment"


class IngredientResponse(IngredientBase):
    id: str
    is_low_stock: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Recipe Schemas ---
class RecipeBase(BaseModel):
    ingredient_id: str
    quantity_required: float = Field(..., gt=0.0)


class RecipeCreate(RecipeBase):
    pass


class RecipeResponse(BaseModel):
    id: str
    product_id: str
    ingredient_id: str
    quantity_required: float
    ingredient_name: Optional[str] = None
    ingredient_unit: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    category: str = "General"
    price: float = Field(..., gt=0.0)
    description: Optional[str] = None


class ProductCreate(ProductBase):
    recipes: Optional[List[RecipeBase]] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0.0)
    description: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    recipes: List[RecipeResponse] = []

    class Config:
        from_attributes = True


# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


# --- Order Schemas ---
class OrderCreate(BaseModel):
    customer_name: Optional[str] = None
    order_type: str = Field(default="Instant", description="Instant or Pre-Order")
    pickup_date: Optional[datetime] = None
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="Pending, In Production, Ready for Pickup, Completed, Cancelled",
    )


class OrderResponse(BaseModel):
    id: str
    customer_name: Optional[str] = None
    order_type: str
    status: str
    pickup_date: Optional[datetime] = None
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# --- Analytics Summary Schema ---
class TopSellingItem(BaseModel):
    product_id: str
    product_name: str
    total_quantity_sold: int
    total_revenue: float


class AnalyticsSummaryResponse(BaseModel):
    daily_revenue: float
    total_revenue: float
    instant_orders_count: int
    active_pre_orders_count: int
    completed_orders_count: int
    cancelled_orders_count: int
    low_stock_ingredients_count: int
    top_selling_items: List[TopSellingItem] = []
