from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Menu Item Schemas ---
class MenuItemBase(BaseModel):
    name: str = Field(..., example="Iced Latte")
    category: str = Field(..., example="Beverages")
    price: float = Field(..., gt=0, example=4.50)
    description: Optional[str] = Field(None, example="Espresso with milk over ice")
    is_available: bool = Field(True, example=True)


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

    model_config = ConfigDict(from_attributes=True)


# --- Table Schemas ---
class TableBase(BaseModel):
    table_number: int = Field(..., gt=0, example=1)
    capacity: int = Field(..., gt=0, example=4)
    status: str = Field(
        "Available", example="Available"
    )  # Available, Reserved, Occupied


class TableCreate(TableBase):
    pass


class TableStatusUpdate(BaseModel):
    status: str = Field(..., example="Reserved")


class TableResponse(TableBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Reservation Schemas ---
class ReservationBase(BaseModel):
    table_id: str
    customer_name: str = Field(..., example="John Doe")
    party_size: int = Field(..., gt=0, example=4)
    reservation_time: datetime
    notes: Optional[str] = None


class ReservationCreate(ReservationBase):
    pass


class ReservationResponse(ReservationBase):
    id: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- Order Item Schemas ---
class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int = Field(1, gt=0)


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    menu_item_id: str
    quantity: int
    unit_price: float
    subtotal: float
    menu_item: Optional[MenuItemResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- Order Schemas ---
class OrderCreate(BaseModel):
    table_id: Optional[str] = None
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        ..., example="Ready"
    )  # Pending, Preparing, Ready, Completed, Cancelled


class OrderResponse(BaseModel):
    id: str
    order_number: str
    table_id: Optional[str] = None
    subtotal: float
    tax: float
    total_price: float
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard Schemas ---
class TopSellingItem(BaseModel):
    id: str
    name: str
    category: str
    total_quantity_sold: int
    total_revenue: float


class DashboardAnalytics(BaseModel):
    today_revenue: float
    completed_orders: int
    active_orders: int
    occupied_tables: int
    total_tables: int
    occupancy_rate: float
    top_selling_items: List[TopSellingItem] = []
