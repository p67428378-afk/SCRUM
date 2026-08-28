from typing import Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from server.dependencies.auth import get_optional_current_user
from server.models.models import User

router = APIRouter(prefix="/api/v1/cart", tags=["cart"])


class CartItemAddRequest(BaseModel):
    product_id: str
    quantity: int = 1


@router.get("")
def get_cart(current_user: Optional[User] = Depends(get_optional_current_user)):
    return {"items": []}


@router.post("", status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item: CartItemAddRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    return {
        "message": "Added to cart",
        "product_id": item.product_id,
        "quantity": item.quantity,
    }
