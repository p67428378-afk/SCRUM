# FastAPI Main Application
import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from .database import engine, Base, get_db
from . import models, schemas, crud

# Create tables if they don't exist (SQLite fallback)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Dollar General category managers",
    version="1.0.0",
)

# CORS Middleware configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Seed initial data on startup
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    try:
        # Check if products already exist
        if db.query(models.Product).count() == 0:
            # Seed Products
            p1 = models.Product(
                sku="SKU-1001",
                name="Clover Valley Potato Chips Classic 10oz",
                brand="Clover Valley",
                is_private_brand=True,
            )
            p2 = models.Product(
                sku="SKU-1002",
                name="Lay's Classic Potato Chips 10oz",
                brand="Lay's",
                is_private_brand=False,
            )
            p3 = models.Product(
                sku="SKU-1003",
                name="Clover Valley Tortilla Chips Restaurant Style 12oz",
                brand="Clover Valley",
                is_private_brand=True,
            )
            p4 = models.Product(
                sku="SKU-1004",
                name="Tostitos Scoops Tortilla Chips 10oz",
                brand="Tostitos",
                is_private_brand=False,
            )
            p5 = models.Product(
                sku="SKU-1005",
                name="Clover Valley Cheese Curls 8oz",
                brand="Clover Valley",
                is_private_brand=True,
            )
            p6 = models.Product(
                sku="SKU-1006",
                name="Cheetos Crunchy Cheese Snacks 8.5oz",
                brand="Cheetos",
                is_private_brand=False,
            )
            p7 = models.Product(
                sku="SKU-1007",
                name="Clover Valley Pretzel Twists 16oz",
                brand="Clover Valley",
                is_private_brand=True,
            )
            p8 = models.Product(
                sku="SKU-1008",
                name="Snyder's of Hanover Mini Pretzels 16oz",
                brand="Snyder's",
                is_private_brand=False,
            )

            db.add_all([p1, p2, p3, p4, p5, p6, p7, p8])
            db.commit()

            # Seed Product Performance
            perf1 = models.ProductPerformance(
                product_id=p1.id, sales=12500.50, margin_pct=38.5, status="GROW"
            )
            perf2 = models.ProductPerformance(
                product_id=p2.id, sales=24500.00, margin_pct=22.0, status="MAINTAIN"
            )
            perf3 = models.ProductPerformance(
                product_id=p3.id, sales=8900.20, margin_pct=35.0, status="GROW"
            )
            perf4 = models.ProductPerformance(
                product_id=p4.id, sales=18200.80, margin_pct=24.5, status="MAINTAIN"
            )
            perf5 = models.ProductPerformance(
                product_id=p5.id, sales=4200.00, margin_pct=32.0, status="SWAP"
            )
            perf6 = models.ProductPerformance(
                product_id=p6.id, sales=15600.40, margin_pct=21.8, status="MAINTAIN"
            )
            perf7 = models.ProductPerformance(
                product_id=p7.id, sales=3100.50, margin_pct=30.0, status="REDUCE"
            )
            perf8 = models.ProductPerformance(
                product_id=p8.id, sales=9800.00, margin_pct=23.0, status="MAINTAIN"
            )

            db.add_all([perf1, perf2, perf3, perf4, perf5, perf6, perf7, perf8])
            db.commit()

        # Seed Scenarios
        if db.query(models.AssortmentScenario).count() == 0:
            s_conservative = models.AssortmentScenario(
                name="Conservative",
                projected_sales_growth=1.5,
                projected_private_brand_pct=28.5,
                projected_shelf_capacity_pct=78.0,
                sku_actions=[
                    {"sku": "SKU-1001", "action": "MAINTAIN"},
                    {"sku": "SKU-1002", "action": "MAINTAIN"},
                    {"sku": "SKU-1003", "action": "MAINTAIN"},
                    {"sku": "SKU-1004", "action": "MAINTAIN"},
                    {"sku": "SKU-1005", "action": "MAINTAIN"},
                    {"sku": "SKU-1006", "action": "MAINTAIN"},
                    {"sku": "SKU-1007", "action": "REDUCE"},
                    {"sku": "SKU-1008", "action": "MAINTAIN"},
                ],
            )
            s_balanced = models.AssortmentScenario(
                name="Balanced",
                projected_sales_growth=4.2,
                projected_private_brand_pct=35.0,
                projected_shelf_capacity_pct=85.0,
                sku_actions=[
                    {"sku": "SKU-1001", "action": "GROW"},
                    {"sku": "SKU-1002", "action": "MAINTAIN"},
                    {"sku": "SKU-1003", "action": "GROW"},
                    {"sku": "SKU-1004", "action": "MAINTAIN"},
                    {"sku": "SKU-1005", "action": "SWAP"},
                    {"sku": "SKU-1006", "action": "MAINTAIN"},
                    {"sku": "SKU-1007", "action": "REDUCE"},
                    {"sku": "SKU-1008", "action": "MAINTAIN"},
                ],
            )
            s_aggressive = models.AssortmentScenario(
                name="Aggressive",
                projected_sales_growth=8.5,
                projected_private_brand_pct=42.0,
                projected_shelf_capacity_pct=92.0,
                sku_actions=[
                    {"sku": "SKU-1001", "action": "GROW"},
                    {"sku": "SKU-1002", "action": "SWAP"},
                    {"sku": "SKU-1003", "action": "GROW"},
                    {"sku": "SKU-1004", "action": "SWAP"},
                    {"sku": "SKU-1005", "action": "GROW"},
                    {"sku": "SKU-1006", "action": "MAINTAIN"},
                    {"sku": "SKU-1007", "action": "REDUCE"},
                    {"sku": "SKU-1008", "action": "REDUCE"},
                ],
            )
            db.add_all([s_conservative, s_balanced, s_aggressive])
            db.commit()

        # Seed test account as required by Constitution
        # email: test@example.com, password: testpassword (mocked/seeded if auth is ever added)
    finally:
        db.close()


@app.get("/api/v1/kpis", response_model=schemas.KPIResponse)
def get_kpis(db: Session = Depends(get_db)):
    try:
        return crud.get_kpis(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query fails: {str(e)}")


@app.get("/api/v1/sku-performance", response_model=schemas.SKUPerformanceResponse)
def get_sku_performance(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db),
):
    if sort_order not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400, detail="Invalid sort_order. Must be 'asc' or 'desc'"
        )
    valid_sort_fields = ["sku", "name", "sales", "margin_pct", "status"]
    if sort_by and sort_by not in valid_sort_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort_by field. Must be one of {valid_sort_fields}",
        )

    return crud.get_sku_performance(
        db,
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@app.get("/api/v1/scenarios/{scenario_name}", response_model=schemas.ScenarioResponse)
def get_scenario(scenario_name: str, db: Session = Depends(get_db)):
    scenario = crud.get_scenario(db, scenario_name)
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_name}' not found"
        )
    return scenario


@app.post("/api/v1/assortment-plans", response_model=schemas.AssortmentPlanResponse)
def create_assortment_plan(
    plan: schemas.AssortmentPlanCreate, db: Session = Depends(get_db)
):
    # Validate scenario exists
    scenario = crud.get_scenario(db, plan.scenario_name)
    if not scenario:
        raise HTTPException(
            status_code=400, detail=f"Invalid scenario name: {plan.scenario_name}"
        )

    # Check critical guardrail violations (e.g., shelf capacity > 95% is a critical violation)
    if scenario["projected_shelf_capacity_pct"] > 95.0:
        raise HTTPException(
            status_code=400,
            detail="Critical guardrail violation: Projected shelf capacity exceeds 95%",
        )

    try:
        db_plan = crud.create_assortment_plan(db, plan)
        return {
            "id": db_plan.id,
            "scenario_name": db_plan.scenario_name,
            "status": "SUCCESS",
            "created_at": db_plan.created_at,
        }
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to submit assortment plan: {str(e)}"
        )
