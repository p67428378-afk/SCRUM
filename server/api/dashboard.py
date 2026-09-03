from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Order, OrderItem, MenuItem, Table
from server.schemas import DashboardAnalyticsResponse, TopMenuItem

router = APIRouter()


@router.get("", response_model=DashboardAnalyticsResponse)
@router.get("/", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    # Calculate revenue from Completed orders
    completed_orders = db.query(Order).filter(Order.status == "Completed").all()
    today_revenue = round(sum(o.total_price for o in completed_orders), 2)

    # Order counts
    active_orders_count = (
        db.query(Order)
        .filter(Order.status.in_(["Pending", "Preparing", "Ready"]))
        .count()
    )
    completed_orders_count = len(completed_orders)
    total_orders_count = db.query(Order).count()

    # Table counts and Occupancy Rate
    occupied_tables_count = db.query(Table).filter(Table.status == "Occupied").count()
    total_tables_count = db.query(Table).count()

    occupancy_rate = (
        round((occupied_tables_count / total_tables_count) * 100.0, 1)
        if total_tables_count > 0
        else 0.0
    )

    # Top selling menu items
    top_items_query = (
        db.query(
            MenuItem.id,
            MenuItem.name,
            MenuItem.category,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(OrderItem, MenuItem.id == OrderItem.menu_item_id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.status != "Cancelled")
        .group_by(MenuItem.id, MenuItem.name, MenuItem.category)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_items = []
    for item in top_items_query:
        top_items.append(
            TopMenuItem(
                id=item.id,
                name=item.name,
                category=item.category,
                total_sold=int(item.total_sold or 0),
                revenue=round(float(item.revenue or 0.0), 2),
            )
        )

    return DashboardAnalyticsResponse(
        today_revenue=today_revenue,
        active_orders=active_orders_count,
        completed_orders=completed_orders_count,
        total_orders=total_orders_count,
        occupied_tables=occupied_tables_count,
        total_tables=total_tables_count,
        occupancy_rate=occupancy_rate,
        top_items=top_items,
    )
