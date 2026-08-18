from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Order, OrderItem, Product, Recipe, Ingredient
from server.schemas import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
    OrderItemResponse,
)

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


def _format_order_response(order: Order) -> OrderResponse:
    item_responses = []
    for item in order.items:
        item_responses.append(
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=round(item.quantity * item.unit_price, 2),
            )
        )

    return OrderResponse(
        id=order.id,
        customer_name=order.customer_name,
        order_type=order.order_type,
        status=order.status,
        pickup_date=order.pickup_date,
        total_amount=round(order.total_amount, 2),
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=item_responses,
    )


@router.get("", response_model=List[OrderResponse])
def list_orders(
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by status"
    ),
    order_type: Optional[str] = Query(
        None, description="Filter by order type (Instant or Pre-Order)"
    ),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status.ilike(status_filter))
    if order_type:
        query = query.filter(Order.order_type.ilike(order_type))

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [_format_order_response(o) for o in orders]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    if not order_in.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # 1. Fetch all products & compute recipe requirements
    required_ingredients: dict[str, float] = {}  # ingredient_id -> total_qty_needed
    order_items_data = []
    total_amount = 0.0

    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found",
            )

        unit_price = product.price
        total_amount += unit_price * item.quantity

        order_items_data.append(
            {
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": unit_price,
            }
        )

        # Calculate ingredient requirements from product recipes
        recipes = db.query(Recipe).filter(Recipe.product_id == product.id).all()
        for recipe in recipes:
            ing_id = recipe.ingredient_id
            qty_needed = recipe.quantity_required * item.quantity
            required_ingredients[ing_id] = (
                required_ingredients.get(ing_id, 0.0) + qty_needed
            )

    # 2. Check ingredient availability
    insufficient_errors = []
    for ing_id, needed_qty in required_ingredients.items():
        ingredient = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
        if not ingredient:
            insufficient_errors.append(
                f"Required ingredient {ing_id} not found in inventory."
            )
        elif ingredient.stock_quantity < needed_qty:
            insufficient_errors.append(
                f"Insufficient stock for '{ingredient.name}': required {needed_qty} {ingredient.unit}, "
                f"available {ingredient.stock_quantity} {ingredient.unit}."
            )

    if insufficient_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=" | ".join(insufficient_errors),
        )

    # 3. Deduct ingredient stock automatically
    for ing_id, needed_qty in required_ingredients.items():
        ingredient = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
        ingredient.stock_quantity -= needed_qty

    # 4. Create Order & OrderItems
    order = Order(
        customer_name=order_in.customer_name,
        order_type=order_in.order_type,
        status="Pending" if order_in.order_type == "Pre-Order" else "Completed",
        pickup_date=order_in.pickup_date,
        total_amount=total_amount,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item_data in order_items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return _format_order_response(order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return _format_order_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str, status_in: OrderStatusUpdate, db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    valid_statuses = [
        "Pending",
        "In Production",
        "Ready for Pickup",
        "Completed",
        "Cancelled",
    ]
    if status_in.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_in.status}'. Must be one of {valid_statuses}",
        )

    # If cancelling an order, restore ingredient stock if it was not completed
    if status_in.status == "Cancelled" and order.status != "Cancelled":
        for item in order.items:
            recipes = (
                db.query(Recipe).filter(Recipe.product_id == item.product_id).all()
            )
            for recipe in recipes:
                ing = (
                    db.query(Ingredient)
                    .filter(Ingredient.id == recipe.ingredient_id)
                    .first()
                )
                if ing:
                    ing.stock_quantity += recipe.quantity_required * item.quantity

    order.status = status_in.status
    db.commit()
    db.refresh(order)
    return _format_order_response(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    db.delete(order)
    db.commit()
    return None
