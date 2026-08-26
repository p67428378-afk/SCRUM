from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# --- Address Schemas ---
class AddressBase(BaseModel):
    full_name: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    addresses: List[AddressResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(..., ge=0)
    material: str
    color: str
    finish_options: List[str] = Field(default_factory=list)
    dimension_options: List[str] = Field(default_factory=list)
    rating: float = Field(default=5.0, ge=0, le=5)
    image_url: str
    stock_quantity: int = Field(default=0, ge=0)
    category_id: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    color: Optional[str] = None
    finish_options: Optional[List[str]] = None
    dimension_options: Optional[List[str]] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = None
    category_id: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int


# --- Cart Schemas ---
class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)
    selected_finish: Optional[str] = None
    selected_dimension: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0)
    selected_finish: Optional[str] = None
    selected_dimension: Optional[str] = None


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    selected_finish: Optional[str] = None
    selected_dimension: Optional[str] = None
    unit_price: float
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse] = Field(default_factory=list)
    subtotal: float
    coupon_code: Optional[str] = None
    discount_percent: float = 0.0
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    shipping_amount: float = 0.0
    total_amount: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class CouponApplyRequest(BaseModel):
    coupon_code: str


class CouponApplyResponse(BaseModel):
    valid: bool
    coupon_code: str
    discount_percent: float
    discount_amount: float
    message: str


# --- Checkout & Order Schemas ---
class ShippingAddress(BaseModel):
    full_name: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = None


class CheckoutEstimateRequest(BaseModel):
    shipping_address: Optional[ShippingAddress] = None
    coupon_code: Optional[str] = None
    subtotal: Optional[float] = None
    shipping_method: Optional[str] = "standard"


class CheckoutEstimateResponse(BaseModel):
    subtotal: float
    discount_amount: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    coupon_applied: Optional[str] = None
    shipping_method: str = "standard"


class OrderCreateRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "Credit Card"
    card_number: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    coupon_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    product_name: str
    quantity: int
    selected_finish: Optional[str] = None
    selected_dimension: Optional[str] = None
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    subtotal: float
    discount_amount: float
    tax_amount: float
    shipping_amount: float
    total_amount: float
    status: str
    shipping_address: Dict[str, Any]
    payment_method: str
    tracking_id: str
    created_at: datetime
    items: List[OrderItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Wishlist Schemas ---
class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
