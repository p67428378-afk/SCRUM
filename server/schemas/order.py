from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class OrderItemCreate(BaseModel):
    menu_item_id: str
    quantity: int


class OrderCreate(BaseModel):
    booking_id: Optional[str] = None
    restaurant_id: str
    items: List[OrderItemCreate]
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    menu_item_id: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True
        orm_mode = True


class OrderResponse(BaseModel):
    id: str
    booking_id: Optional[str] = None
    restaurant_id: str
    total_price: Decimal
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
        orm_mode = True


class OrderStatusUpdate(BaseModel):
    status: str


# Nested schemas for detailed GET responses
class RoomNested(BaseModel):
    id: str
    room_number: str

    class Config:
        from_attributes = True
        orm_mode = True


class BookingNested(BaseModel):
    id: str
    guest_name: str
    room: RoomNested

    class Config:
        from_attributes = True
        orm_mode = True


class RestaurantNested(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True
        orm_mode = True


class MenuItemNested(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True
        orm_mode = True


class OrderItemDetailedResponse(BaseModel):
    id: str
    menu_item_id: str
    quantity: int
    price: Decimal
    menu_item: MenuItemNested

    class Config:
        from_attributes = True
        orm_mode = True


class OrderDetailedResponse(BaseModel):
    id: str
    booking_id: Optional[str] = None
    restaurant_id: str
    total_price: Decimal
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    booking: Optional[BookingNested] = None
    restaurant: RestaurantNested
    items: List[OrderItemDetailedResponse]

    class Config:
        from_attributes = True
        orm_mode = True
