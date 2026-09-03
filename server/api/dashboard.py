from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from server.database import get_db, seed_data
from server.models import MenuItem, Order, OrderItem, Table
from server.schemas import DashboardAnalytics, TopSellingItem

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardAnalytics)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    seed_data(db)
    # Calculate revenue from completed orders (or all non-cancelled orders if testing)
    revenue_res = (
        db.query(func.sum(Order.total_price))
        .filter(Order.status.in_(["Completed", "Ready", "Preparing", "Pending"]))
        .scalar()
    )
    today_revenue = round(revenue_res or 0.0, 2)

    completed_orders = db.query(Order).filter(Order.status == "Completed").count()
    active_orders = (
        db.query(Order)
        .filter(Order.status.in_(["Pending", "Preparing", "Ready"]))
        .count()
    )

    total_tables = db.query(Table).count()
    occupied_tables = db.query(Table).filter(Table.status == "Occupied").count()
    occupancy_rate = (
        round((occupied_tables / total_tables * 100.0), 1) if total_tables > 0 else 0.0
    )

    # Top selling items
    top_items_query = (
        db.query(
            MenuItem.id,
            MenuItem.name,
            MenuItem.category,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("total_rev"),
        )
        .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
        .group_by(MenuItem.id, MenuItem.name, MenuItem.category)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_selling_items = [
        TopSellingItem(
            id=item.id,
            name=item.name,
            category=item.category,
            total_quantity_sold=item.total_sold or 0,
            total_revenue=round(item.total_rev or 0.0, 2),
        )
        for item in top_items_query
    ]

    return DashboardAnalytics(
        today_revenue=today_revenue,
        completed_orders=completed_orders,
        active_orders=active_orders,
        occupied_tables=occupied_tables,
        total_tables=total_tables,
        occupancy_rate=occupancy_rate,
        top_selling_items=top_selling_items,
    )
