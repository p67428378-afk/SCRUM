from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Category Schema
class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# Product Variant Schemas
class ProductVariantResponse(BaseModel):
    id: str
    product_id: str
    size: Optional[str] = None
    color: Optional[str] = None
    stock_quantity: int
    sku: str

    class Config:
        from_attributes = True


# Product Schemas
class ProductResponse(BaseModel):
    id: str
    category_id: str
    title: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class ProductDetailResponse(ProductResponse):
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int


# Cart Schemas
class CartItemAdd(BaseModel):
    variant_id: str
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: str
    variant_id: str
    quantity: int
    variant: ProductVariantResponse
    product: ProductResponse
    item_total: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    shipping_estimate: float
    tax_estimate: float
    total: float


# Order Schemas
class CheckoutRequest(BaseModel):
    shipping_address: str = Field(..., min_length=5)
    payment_method: str = Field("Card")


class OrderItemResponse(BaseModel):
    id: str
    variant_id: str
    unit_price: float
    quantity: int
    variant: Optional[ProductVariantResponse] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    user_id: str
    status: str
    subtotal: float
    shipping_fee: float
    tax_amount: float
    total_amount: float
    shipping_address: str
    payment_method: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    skip: int
    limit: int


# Activity Log & Billing Schemas
class UserActivityLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    activity_type: str
    endpoint: str
    http_method: str
    status_code: int
    client_ip: Optional[str] = None
    execution_ms: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserActivityLogList(BaseModel):
    items: List[UserActivityLogResponse]
    total: int
    skip: int
    limit: int


class UserLoginStatsResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    login_count: int
    pricing_tier: str
    last_login_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Wishlist Schemas
class WishlistCreateRequest(BaseModel):
    product_id: str


class WishlistActionResponse(BaseModel):
    message: str
    product_id: str


class WishlistProduct(BaseModel):
    id: str
    name: str
    price: float
    image_url: Optional[str] = None
    in_stock: bool = True

    class Config:
        from_attributes = True


class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime
    product: WishlistProduct

    class Config:
        from_attributes = True
