from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import ClusterMetric, SKU
from server.schemas import KPIMetricsResponse

router = APIRouter(prefix="/api/v1/metrics", tags=["metrics"])


@router.get("/kpi", response_model=KPIMetricsResponse)
def get_kpi_metrics(
    cluster_name: str = Query(default="Small Town Value Cluster"),
    category: str = Query(default="Snacks"),
    db: Session = Depends(get_db)
):
    metric = db.query(ClusterMetric).filter(
        ClusterMetric.cluster_name == cluster_name,
        ClusterMetric.category == category
    ).first()

    if metric:
        return metric

    # Fallback / dynamic computation if cluster metric row not directly found
    skus = db.query(SKU).filter(
        SKU.cluster_id == cluster_name,
        SKU.category == category
    ).all()

    if skus:
        total_units = sum(s.weekly_units_sold for s in skus)
        pb_units = sum(s.weekly_units_sold for s in skus if s.is_private_brand)
        pb_pct = round((pb_units / total_units * 100.0), 2) if total_units > 0 else 28.00
        avg_sales_ft = round(sum(s.sales_per_linear_ft for s in skus) / len(skus), 2)
        return KPIMetricsResponse(
            cluster_name=cluster_name,
            category=category,
            sales_per_linear_ft=avg_sales_ft,
            private_brand_percentage=pb_pct,
            in_stock_rate=96.50,
            shelf_capacity_utilization=85.00
        )

    # Return standard benchmark defaults
    return KPIMetricsResponse(
        cluster_name=cluster_name,
        category=category,
        sales_per_linear_ft=1250.00,
        private_brand_percentage=28.00,
        in_stock_rate=96.50,
        shelf_capacity_utilization=85.00
    )
