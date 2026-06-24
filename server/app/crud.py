"""
Module: server.app.crud
Purpose: Database operations (CRUD) and seeding.
Author: Backend Developer Agent
Created: 2026-06-24
"""

import uuid
from sqlalchemy.orm import Session, joinedload
from server.app.models import Product, PerformanceMetric, Scenario, Submission
from server.app.schemas import (
    KPIMetrics,
    Guardrails,
    ScenarioImpact,
    SkuAction,
    ScenarioResponse,
    SKUPerformance,
)


def get_dashboard_data(db: Session):
    """
    Fetch all dashboard data including KPI metrics, SKU performance, and scenarios.
    """
    # Eager load performance metrics to avoid N+1 queries as per §6.3
    products = db.query(Product).options(joinedload(Product.performance_metrics)).all()

    sku_performance_list = []
    for p in products:
        for pm in p.performance_metrics:
            sku_performance_list.append(
                SKUPerformance(
                    id=p.id,
                    sku=p.sku,
                    name=p.name,
                    brand=p.brand,
                    private_brand=p.private_brand,
                    sales=float(pm.sales),
                    linear_ft=float(pm.linear_ft),
                    sales_per_linear_ft=float(pm.sales_per_linear_ft),
                    in_stock_rate=float(pm.in_stock_rate),
                    shelf_capacity_pct=float(pm.shelf_capacity_pct),
                    recommended_action=pm.recommended_action,
                )
            )

    # Fetch scenarios
    db_scenarios = db.query(Scenario).all()
    scenarios_list = []
    for s in db_scenarios:
        scenarios_list.append(
            ScenarioResponse(
                name=s.name,
                description=s.description,
                guardrails=Guardrails(**s.guardrails_json),
                projected_impact=ScenarioImpact(
                    in_stock_rate=float(s.projected_in_stock_rate),
                    private_brand_pct=float(s.projected_private_brand_pct),
                    sales_per_linear_ft=float(s.projected_sales_per_linear_ft),
                    shelf_capacity=float(s.projected_shelf_capacity),
                ),
                sku_actions=[SkuAction(**action) for action in s.sku_actions_json],
            )
        )

    # Hardcoded cluster-level KPI metrics as specified in the WorkSpec
    kpi_metrics = KPIMetrics(
        in_stock_rate=96.2,
        private_brand_pct=28.4,
        sales_per_linear_ft=124.5,
        shelf_capacity=85.0,
    )

    return {
        "kpi_metrics": kpi_metrics,
        "scenarios": scenarios_list,
        "sku_performance": sku_performance_list,
    }


def create_submission(
    db: Session, scenario_name: str, sku_actions: list, submitted_by: str
):
    """
    Create a new assortment plan submission.
    """
    # Convert sku_actions to JSON-serializable list of dicts
    sku_actions_json = [
        {"sku": action.sku, "action": action.action} for action in sku_actions
    ]

    db_submission = Submission(
        id=str(uuid.uuid4()),
        scenario_name=scenario_name,
        sku_actions_json=sku_actions_json,
        submitted_by=submitted_by,
    )
    db.add(db_submission)
    # Note: The route handler owns the commit as per §6.3 ("NEVER call db.commit() inside a service/helper function")
    return db_submission


def seed_initial_data(db: Session):
    """
    Idempotently seed initial products, performance metrics, and scenarios.
    """
    # 1. Seed Products and Performance Metrics
    if db.query(Product).count() == 0:
        product = Product(
            id="uuid-1",
            sku="SKU-1001",
            name="Lay's Classic Potato Chips 8oz",
            brand="Lay's",
            private_brand=False,
        )
        db.add(product)

        metric = PerformanceMetric(
            id=str(uuid.uuid4()),
            product_id=product.id,
            sales=15200.00,
            linear_ft=2.5,
            sales_per_linear_ft=6080.00,
            in_stock_rate=98.5,
            shelf_capacity_pct=75.0,
            recommended_action="MAINTAIN",
        )
        db.add(metric)

    # 2. Seed Scenarios
    if db.query(Scenario).count() == 0:
        scenarios = [
            Scenario(
                id=str(uuid.uuid4()),
                name="Conservative",
                description="Focus on low-risk, high-margin national brands with minimal changes.",
                projected_sales_per_linear_ft=118.2,
                projected_private_brand_pct=22.1,
                projected_in_stock_rate=97.8,
                projected_shelf_capacity=80.0,
                guardrails_json={
                    "in_stock_rate_above_minimum": True,
                    "private_brand_target_met": False,
                    "shelf_capacity_within_limits": True,
                },
                sku_actions_json=[{"sku": "SKU-1001", "action": "MAINTAIN"}],
            ),
            Scenario(
                id=str(uuid.uuid4()),
                name="Balanced",
                description="Optimized mix of national and private brands to balance sales and margin.",
                projected_sales_per_linear_ft=128.4,
                projected_private_brand_pct=29.5,
                projected_in_stock_rate=96.5,
                projected_shelf_capacity=84.5,
                guardrails_json={
                    "in_stock_rate_above_minimum": True,
                    "private_brand_target_met": True,
                    "shelf_capacity_within_limits": True,
                },
                sku_actions_json=[{"sku": "SKU-1001", "action": "GROW"}],
            ),
            Scenario(
                id=str(uuid.uuid4()),
                name="Aggressive",
                description="Maximize private brand penetration and shelf space utilization.",
                projected_sales_per_linear_ft=135.1,
                projected_private_brand_pct=35.2,
                projected_in_stock_rate=94.1,
                projected_shelf_capacity=92.0,
                guardrails_json={
                    "in_stock_rate_above_minimum": False,
                    "private_brand_target_met": True,
                    "shelf_capacity_within_limits": False,
                },
                sku_actions_json=[{"sku": "SKU-1001", "action": "GROW"}],
            ),
        ]
        for s in scenarios:
            db.add(s)

    db.commit()
