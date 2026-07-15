# CRUD operations and business logic
from sqlalchemy.orm import Session
from sqlalchemy import func, Column
from . import models, schemas
from typing import Optional, Dict, Any as AnyType


def get_kpis(db: Session) -> Dict[str, float]:
    # Calculate current KPIs based on products and performance
    total_sales = db.query(func.sum(models.ProductPerformance.sales)).scalar() or 0
    total_products = db.query(func.count(models.Product.id)).scalar() or 1

    private_brand_count = (
        db.query(func.count(models.Product.id))
        .filter(models.Product.is_private_brand)
        .scalar()
        or 0
    )
    private_brand_pct = (
        (private_brand_count / total_products) * 100 if total_products > 0 else 0.0
    )

    # Return mock/calculated values for linear ft, in-stock, shelf capacity
    sales_per_linear_ft = float(total_sales) / 120.0 if total_sales else 450.50
    in_stock_rate = 94.8
    shelf_capacity = 85.0

    return {
        "sales_per_linear_ft": round(sales_per_linear_ft, 2),
        "private_brand_pct": round(private_brand_pct, 2),
        "in_stock_rate": in_stock_rate,
        "shelf_capacity": shelf_capacity,
    }


def get_sku_performance(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
) -> Dict[str, AnyType]:
    query = db.query(
        models.Product.id,
        models.Product.sku,
        models.Product.name,
        models.Product.brand,
        models.Product.is_private_brand,
        models.ProductPerformance.sales,
        models.ProductPerformance.margin_pct,
        models.ProductPerformance.status,
    ).join(
        models.ProductPerformance,
        models.Product.id == models.ProductPerformance.product_id,
    )

    if search:
        query = query.filter(
            (models.Product.name.ilike(f"%{search}%"))
            | (models.Product.sku.ilike(f"%{search}%"))
            | (models.Product.brand.ilike(f"%{search}%"))
        )

    # Sorting
    if sort_by:
        col: Optional[Column] = None
        if sort_by == "sales":
            col = models.ProductPerformance.sales
        elif sort_by == "margin_pct":
            col = models.ProductPerformance.margin_pct
        elif sort_by == "sku":
            col = models.Product.sku
        elif sort_by == "name":
            col = models.Product.name
        elif sort_by == "status":
            col = models.ProductPerformance.status

        if col is not None:
            if sort_order == "desc":
                query = query.order_by(col.desc())
            else:
                query = query.order_by(col.asc())

    total = query.count()
    results = query.offset(skip).limit(limit).all()

    items = []
    for r in results:
        items.append(
            {
                "id": r[0],
                "sku": r[1],
                "name": r[2],
                "brand": r[3],
                "is_private_brand": r[4],
                "sales": float(r[5]),
                "margin_pct": float(r[6]),
                "status": r[7],
            }
        )

    page = (skip // limit) + 1
    return {"items": items, "total": total, "page": page, "limit": limit}


def get_scenario(db: Session, scenario_name: str) -> Optional[Dict[str, AnyType]]:
    scenario = (
        db.query(models.AssortmentScenario)
        .filter(models.AssortmentScenario.name.ilike(scenario_name))
        .first()
    )
    if not scenario:
        return None

    actions = scenario.sku_actions

    return {
        "scenario_name": scenario.name,
        "projected_sales_growth": float(scenario.projected_sales_growth),
        "projected_private_brand_pct": float(scenario.projected_private_brand_pct),
        "projected_shelf_capacity_pct": float(scenario.projected_shelf_capacity_pct),
        "sku_actions": actions,
    }


def create_assortment_plan(
    db: Session, plan: schemas.AssortmentPlanCreate, user_id: str = "system_user"
) -> models.AssortmentPlan:
    db_plan = models.AssortmentPlan(
        user_id=user_id,
        scenario_name=plan.scenario_name,
        plan_details=plan.plan_details,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan
