from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class RestaurantBase(BaseModel):
    name: str
    cuisine: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    operating_hours: Optional[str] = None


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantResponse(RestaurantBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    category: Optional[str] = None


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemResponse(MenuItemBase):
    id: str
    restaurant_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
