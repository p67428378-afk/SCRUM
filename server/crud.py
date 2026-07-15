from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from . import models, schemas
import json


def get_kpis(db: Session):
    # Calculate KPIs based on products and performance
    # sales_per_linear_ft: average sales of all products / 10 (mock linear ft)
    # private_brand_pct: percentage of private brand products
    # in_stock_rate: mock constant or calculated
    # shelf_capacity: mock constant or calculated
    total_products = db.query(models.Product).count()
    if total_products == 0:
        return {
            "sales_per_linear_ft": 0.0,
            "private_brand_pct": 0.0,
            "in_stock_rate": 95.5,
            "shelf_capacity": 82.0,
        }

    private_brand_count = (
        db.query(models.Product).filter(models.Product.is_private_brand).count()
    )
    private_brand_pct = (private_brand_count / total_products) * 100.0

    avg_sales = db.query(func.avg(models.ProductPerformance.sales)).scalar() or 0.0
    sales_per_linear_ft = float(avg_sales) / 12.5  # Mock linear ft divisor

    return {
        "sales_per_linear_ft": round(sales_per_linear_ft, 2),
        "private_brand_pct": round(private_brand_pct, 1),
        "in_stock_rate": 96.8,
        "shelf_capacity": 85.0,
    }


def get_sku_performance(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
):
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
            or_(
                models.Product.sku.ilike(f"%{search}%"),
                models.Product.name.ilike(f"%{search}%"),
                models.Product.brand.ilike(f"%{search}%"),
            )
        )

    # Sorting
    if sort_by:
        col = None
        if sort_by == "sku":
            col = models.Product.sku
        elif sort_by == "name":
            col = models.Product.name
        elif sort_by == "brand":
            col = models.Product.brand
        elif sort_by == "sales":
            col = models.ProductPerformance.sales
        elif sort_by == "margin_pct":
            col = models.ProductPerformance.margin_pct
        elif sort_by == "status":
            col = models.ProductPerformance.status

        if col is not None:
            if sort_order == "desc":
                query = query.order_by(col.desc())
            else:
                query = query.order_by(col.asc())
    else:
        query = query.order_by(models.Product.sku.asc())

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


def get_scenario(db: Session, scenario_name: str):
    scenario = (
        db.query(models.AssortmentScenario)
        .filter(models.AssortmentScenario.name.ilike(scenario_name))
        .first()
    )
    if not scenario:
        return None

    # Handle JSON parsing for SQLite vs PostgreSQL
    actions = scenario.sku_actions
    if isinstance(actions, str):
        actions = json.loads(actions)

    return {
        "scenario_name": scenario.name,
        "projected_sales_growth": float(scenario.projected_sales_growth),
        "projected_private_brand_pct": float(scenario.projected_private_brand_pct),
        "projected_shelf_capacity_pct": float(scenario.projected_shelf_capacity_pct),
        "sku_actions": actions,
    }


def create_assortment_plan(
    db: Session, plan: schemas.AssortmentPlanCreate, user_id: str = "system_manager"
):
    db_plan = models.AssortmentPlan(
        user_id=user_id,
        scenario_name=plan.scenario_name,
        plan_details=plan.plan_details,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def seed_initial_data(db: Session):
    # Check if already seeded
    if db.query(models.Product).count() > 0:
        return

    # Seed Products & Performance
    initial_products = [
        {
            "sku": "SKU-1001",
            "name": "Clover Valley Potato Chips Classic",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales": 12500.50,
            "margin_pct": 38.5,
            "status": "GROW",
        },
        {
            "sku": "SKU-1002",
            "name": "Lay's Classic Potato Chips",
            "brand": "Lay's",
            "is_private_brand": False,
            "sales": 24000.00,
            "margin_pct": 22.0,
            "status": "MAINTAIN",
        },
        {
            "sku": "SKU-1003",
            "name": "Clover Valley Tortilla Chips",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales": 8500.00,
            "margin_pct": 42.0,
            "status": "GROW",
        },
        {
            "sku": "SKU-1004",
            "name": "Doritos Nacho Cheese",
            "brand": "Doritos",
            "is_private_brand": False,
            "sales": 19500.00,
            "margin_pct": 24.5,
            "status": "MAINTAIN",
        },
        {
            "sku": "SKU-1005",
            "name": "Clover Valley Cheese Curls",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales": 4200.00,
            "margin_pct": 45.0,
            "status": "REDUCE",
        },
        {
            "sku": "SKU-1006",
            "name": "Cheetos Crunchy Cheese Snacks",
            "brand": "Cheetos",
            "is_private_brand": False,
            "sales": 15000.00,
            "margin_pct": 23.0,
            "status": "MAINTAIN",
        },
        {
            "sku": "SKU-1007",
            "name": "Clover Valley Pretzels Minis",
            "brand": "Clover Valley",
            "is_private_brand": True,
            "sales": 3100.00,
            "margin_pct": 40.0,
            "status": "SWAP",
        },
        {
            "sku": "SKU-1008",
            "name": "Snyder's of Hanover Mini Pretzels",
            "brand": "Snyder's",
            "is_private_brand": False,
            "sales": 9800.00,
            "margin_pct": 26.0,
            "status": "MAINTAIN",
        },
    ]

    for p_data in initial_products:
        prod = models.Product(
            sku=p_data["sku"],
            name=p_data["name"],
            brand=p_data["brand"],
            is_private_brand=p_data["is_private_brand"],
        )
        db.add(prod)
        db.flush()  # Get ID

        perf = models.ProductPerformance(
            product_id=prod.id,
            sales=p_data["sales"],
            margin_pct=p_data["margin_pct"],
            status=p_data["status"],
        )
        db.add(perf)

    # Seed Scenarios
    scenarios = [
        {
            "name": "Conservative",
            "projected_sales_growth": 1.5,
            "projected_private_brand_pct": 28.0,
            "projected_shelf_capacity_pct": 75.0,
            "sku_actions": [
                {"sku": "SKU-1001", "action": "MAINTAIN"},
                {"sku": "SKU-1002", "action": "MAINTAIN"},
                {"sku": "SKU-1003", "action": "MAINTAIN"},
                {"sku": "SKU-1004", "action": "MAINTAIN"},
                {"sku": "SKU-1005", "action": "REDUCE"},
                {"sku": "SKU-1006", "action": "MAINTAIN"},
                {"sku": "SKU-1007", "action": "REDUCE"},
                {"sku": "SKU-1008", "action": "MAINTAIN"},
            ],
        },
        {
            "name": "Balanced",
            "projected_sales_growth": 4.2,
            "projected_private_brand_pct": 35.5,
            "projected_shelf_capacity_pct": 85.0,
            "sku_actions": [
                {"sku": "SKU-1001", "action": "GROW"},
                {"sku": "SKU-1002", "action": "MAINTAIN"},
                {"sku": "SKU-1003", "action": "GROW"},
                {"sku": "SKU-1004", "action": "MAINTAIN"},
                {"sku": "SKU-1005", "action": "REDUCE"},
                {"sku": "SKU-1006", "action": "MAINTAIN"},
                {"sku": "SKU-1007", "action": "SWAP"},
                {"sku": "SKU-1008", "action": "MAINTAIN"},
            ],
        },
        {
            "name": "Aggressive",
            "projected_sales_growth": 8.5,
            "projected_private_brand_pct": 45.0,
            "projected_shelf_capacity_pct": 95.0,
            "sku_actions": [
                {"sku": "SKU-1001", "action": "GROW"},
                {"sku": "SKU-1002", "action": "SWAP"},
                {"sku": "SKU-1003", "action": "GROW"},
                {"sku": "SKU-1004", "action": "SWAP"},
                {"sku": "SKU-1005", "action": "REDUCE"},
                {"sku": "SKU-1006", "action": "GROW"},
                {"sku": "SKU-1007", "action": "GROW"},
                {"sku": "SKU-1008", "action": "REDUCE"},
            ],
        },
    ]

    for s_data in scenarios:
        scen = models.AssortmentScenario(
            name=s_data["name"],
            projected_sales_growth=s_data["projected_sales_growth"],
            projected_private_brand_pct=s_data["projected_private_brand_pct"],
            projected_shelf_capacity_pct=s_data["projected_shelf_capacity_pct"],
            sku_actions=s_data["sku_actions"],
        )
        db.add(scen)

    db.commit()
