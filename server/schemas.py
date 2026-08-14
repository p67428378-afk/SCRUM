from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# --- Address Schemas ---
class AddressBase(BaseModel):
    street_address: str
    city: str
    postal_code: str
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    id: str
    user_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "CUSTOMER"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    created_at: Optional[datetime] = None
    addresses: List[AddressResponse] = []

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    display_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True


# --- Menu Item Schemas ---
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    dietary_tags: Optional[str] = None  # e.g., "Veg,Chef Special"
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    category_id: str


class MenuItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    dietary_tags: Optional[str] = None
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    id: str
    category_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Order Schemas ---
class CartItemRequest(BaseModel):
    menu_item_id: str
    quantity: int = Field(..., gt=0)


class OrderCreateRequest(BaseModel):
    items: List[CartItemRequest]
    delivery_address_text: Optional[str] = None
    address_id: Optional[str] = None
    special_instructions: Optional[str] = None
    payment_method: Optional[str] = "Credit/Debit Card"


class OrderItemResponse(BaseModel):
    id: str
    menu_item_id: Optional[str] = None
    menu_item_name: Optional[str] = None
    quantity: int
    unit_price: float
    item_total: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_number: str
    status: str
    total_amount: float
    delivery_fee: float = 3.00
    delivery_address_text: str
    special_instructions: Optional[str] = None
    payment_method: Optional[str] = "Credit/Debit Card"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


class StaffDashboardResponse(BaseModel):
    orders: List[OrderResponse]
    status_counts: Dict[str, int]
    menu_availability_items: List[MenuItemResponse]
