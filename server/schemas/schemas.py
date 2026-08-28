from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    in_stock: bool
    stock_quantity: int
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistItemAddRequest(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True


class MoveToCartResponse(BaseModel):
    product_id: str
    message: str


class RewardBalanceResponse(BaseModel):
    user_id: str
    points_balance: int


class CheckoutItemRequest(BaseModel):
    product_id: str
    quantity: int = 1


class CheckoutRequest(BaseModel):
    items: Optional[List[CheckoutItemRequest]] = None
    shipping_address: Optional[str] = None


class CheckoutResponse(BaseModel):
    id: str
    total_amount: float
    points_awarded: int
    new_points_balance: int
    status: str = "completed"


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: float
    product: ProductResponse

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    points_awarded: int
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


# Review Schemas
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating between 1 and 5 stars")
    comment: Optional[str] = None


class ReviewItemResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    product_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    product_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    points_awarded: int = 50
    new_total_points: Optional[int] = None

    class Config:
        from_attributes = True


class ProductReviewsListResponse(BaseModel):
    product_id: str
    average_rating: float
    total_reviews: int
    reviews: List[ReviewItemResponse]
