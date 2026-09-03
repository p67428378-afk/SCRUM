from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# --- MenuItem Schemas ---
class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., description="Beverages, Food, Desserts")
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Table Schemas ---
class TableBase(BaseModel):
    table_number: int = Field(..., gt=0)
    capacity: int = Field(..., gt=0)
    status: str = Field("Available", description="Available, Reserved, Occupied")


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    capacity: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None


class TableResponse(TableBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Reservation Schemas ---
class ReservationBase(BaseModel):
    table_id: str
    customer_name: str = Field(..., min_length=1)
    party_size: int = Field(..., gt=0)
    reservation_time: str = Field(
        ..., description="ISO datetime string or YYYY-MM-DD HH:MM"
    )
    notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- OrderItem Schemas ---
class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = Field(1, gt=0)


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    menu_item_id: str
    menu_item_name: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float

    class Config:
        from_attributes = True


# --- Order Schemas ---
class OrderCreate(BaseModel):
    table_id: Optional[str] = None
    items: List[OrderItemCreate] = Field(..., min_items=1)


class OrderUpdateStatus(BaseModel):
    status: str = Field(
        ..., description="Pending, Preparing, Ready, Completed, Cancelled"
    )


class OrderResponse(BaseModel):
    id: str
    order_number: str
    table_id: Optional[str] = None
    subtotal: float
    tax: float
    total_price: float
    status: str
    items: List[OrderItemResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Dashboard Schemas ---
class TopMenuItem(BaseModel):
    id: str
    name: str
    category: str
    total_sold: int
    revenue: float


class DashboardAnalyticsResponse(BaseModel):
    today_revenue: float
    active_orders: int
    completed_orders: int
    total_orders: int
    occupied_tables: int
    total_tables: int
    occupancy_rate: float
    top_items: List[TopMenuItem] = []
