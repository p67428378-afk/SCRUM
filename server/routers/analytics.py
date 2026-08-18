from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from server.database import get_db
from server.models import Order, OrderItem, Ingredient, Product
from server.schemas import AnalyticsSummaryResponse, TopSellingItem

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    # 1. Daily Revenue
    daily_rev = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0.0))
        .filter(Order.created_at >= today_start, Order.status != "Cancelled")
        .scalar()
    )

    # 2. Total Revenue
    total_rev = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0.0))
        .filter(Order.status != "Cancelled")
        .scalar()
    )

    # 3. Counts
    instant_count = db.query(Order).filter(Order.order_type == "Instant").count()
    active_pre_orders = (
        db.query(Order)
        .filter(
            Order.order_type == "Pre-Order",
            Order.status.in_(["Pending", "In Production", "Ready for Pickup"]),
        )
        .count()
    )
    completed_count = db.query(Order).filter(Order.status == "Completed").count()
    cancelled_count = db.query(Order).filter(Order.status == "Cancelled").count()

    # 4. Low stock ingredients
    low_stock_count = (
        db.query(Ingredient)
        .filter(Ingredient.stock_quantity <= Ingredient.reorder_threshold)
        .count()
    )

    # 5. Top selling items
    top_items_query = (
        db.query(
            OrderItem.product_id,
            Product.name.label("product_name"),
            func.sum(OrderItem.quantity).label("total_qty"),
            func.sum(OrderItem.quantity * OrderItem.unit_price).label("total_rev"),
        )
        .join(Product, Product.id == OrderItem.product_id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status != "Cancelled")
        .group_by(OrderItem.product_id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_selling = [
        TopSellingItem(
            product_id=row.product_id,
            product_name=row.product_name,
            total_quantity_sold=int(row.total_qty),
            total_revenue=float(row.total_rev),
        )
        for row in top_items_query
    ]

    return AnalyticsSummaryResponse(
        daily_revenue=float(daily_rev),
        total_revenue=float(total_rev),
        instant_orders_count=instant_count,
        active_pre_orders_count=active_pre_orders,
        completed_orders_count=completed_count,
        cancelled_orders_count=cancelled_count,
        low_stock_ingredients_count=low_stock_count,
        top_selling_items=top_selling,
    )
