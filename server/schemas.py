from datetime import datetime
from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ==========================
# Auth & User Schemas
# ==========================


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# ==========================
# Category Schemas
# ==========================


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================
# Book Schemas
# ==========================


class BookBase(BaseModel):
    title: str
    author: str
    isbn: str
    category_id: str
    price: float = Field(..., ge=0.0)
    stock_quantity: int = Field(0, ge=0)
    rating: float = Field(0.0, ge=0.0, le=5.0)
    summary: Optional[str] = None
    cover_image: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    category_id: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    rating: Optional[float] = None
    summary: Optional[str] = None
    cover_image: Optional[str] = None


class BookResponse(BookBase):
    id: str
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookListResponse(BaseModel):
    items: List[BookResponse]
    total: int
    skip: int
    limit: int


# ==========================
# Cart Schemas
# ==========================


class CartItemCreate(BaseModel):
    book_id: str
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: str
    cart_id: str
    book_id: str
    book: Optional[BookResponse] = None
    quantity: int
    item_total: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: str
    user_id: str
    items: List[CartItemResponse]
    item_count: int
    subtotal: float
    estimated_tax: float
    estimated_shipping: float
    total_amount: float

    model_config = ConfigDict(from_attributes=True)


# ==========================
# Order Schemas
# ==========================


class ShippingAddress(BaseModel):
    full_name: str
    street_address: str
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = None


class PaymentMethod(BaseModel):
    card_holder: Optional[str] = None
    card_number: Optional[str] = None
    card_number_last4: Optional[str] = "4242"
    payment_type: Optional[str] = "Credit Card"


class CheckoutRequest(BaseModel):
    shipping_address: Union[ShippingAddress, Dict[str, Any]]
    payment_method: Optional[Union[PaymentMethod, Dict[str, Any]]] = None


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    book_id: str
    book: Optional[BookResponse] = None
    quantity: int
    unit_price: float
    line_total: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    user_id: str
    status: str
    subtotal: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    shipping_address: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
