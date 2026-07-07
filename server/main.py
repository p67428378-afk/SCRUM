import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from .database import engine, Base, get_db
from . import models, crud, schemas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Snacks category managers",
    version="1.0.0",
)

# CORS Middleware
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


# Seed initial data if tables are empty
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    try:
        # Seed KPIs
        if db.query(models.KPI).count() == 0:
            kpi = models.KPI(
                sales_per_linear_ft=15.75,
                private_brand_pct=24.5,
                in_stock_rate=98.2,
                shelf_capacity=88.0,
                sales_trend_pct=4.2,
                private_brand_status="Warning",
                in_stock_status="Healthy",
            )
            db.add(kpi)

        # Seed SKUs
        if db.query(models.SKU).count() == 0:
            skus = [
                models.SKU(
                    sku="SKU-8821",
                    name="Clover Valley Potato Chips 10oz",
                    sales=42500,
                    units=17000,
                    profit=14875,
                    status="GROW",
                ),
                models.SKU(
                    sku="SKU-4412",
                    name="Lay's Classic Potato Chips 13oz",
                    sales=38200,
                    units=11200,
                    profit=9550,
                    status="MAINTAIN",
                ),
                models.SKU(
                    sku="SKU-9012",
                    name="Clover Valley Cheese Curls 8oz",
                    sales=12400,
                    units=6200,
                    profit=3100,
                    status="SWAP",
                ),
                models.SKU(
                    sku="SKU-3115",
                    name="Doritos Nacho Cheese 9.25oz",
                    sales=31000,
                    units=8800,
                    profit=7750,
                    status="MAINTAIN",
                ),
                models.SKU(
                    sku="SKU-1104",
                    name="Generic Tortilla Strips 16oz",
                    sales=4100,
                    units=1500,
                    profit=820,
                    status="REDUCE",
                ),
            ]
            db.add_all(skus)

        # Seed Scenarios
        if db.query(models.Scenario).count() == 0:
            scenarios = [
                models.Scenario(
                    name="Conservative",
                    projected_sales=1.2,
                    projected_private_brand_pct=22.0,
                    grow_count=20,
                    maintain_count=60,
                    swap_count=10,
                    reduce_count=10,
                    shelf_capacity_status="OK",
                    pb_penetration_status="MET",
                ),
                models.Scenario(
                    name="Balanced",
                    projected_sales=4.8,
                    projected_private_brand_pct=25.2,
                    grow_count=40,
                    maintain_count=30,
                    swap_count=15,
                    reduce_count=15,
                    shelf_capacity_status="OK",
                    pb_penetration_status="MET",
                ),
                models.Scenario(
                    name="Aggressive",
                    projected_sales=8.5,
                    projected_private_brand_pct=30.1,
                    grow_count=60,
                    maintain_count=10,
                    swap_count=20,
                    reduce_count=10,
                    shelf_capacity_status="OK",
                    pb_penetration_status="MET",
                ),
            ]
            db.add_all(scenarios)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


@app.get("/api/v1/kpis", response_model=schemas.KPISchema)
def get_kpis(db: Session = Depends(get_db)):
    kpi = crud.get_kpis(db)
    if not kpi:
        raise HTTPException(status_code=500, detail="KPI data not initialized")
    return kpi


@app.get("/api/v1/skus", response_model=list[schemas.SKUSchema])
def get_skus(db: Session = Depends(get_db)):
    return crud.get_skus(db)


@app.post("/api/v1/scenarios", response_model=schemas.ScenarioResponse)
def select_scenario(payload: schemas.ScenarioRequest, db: Session = Depends(get_db)):
    scenario = crud.get_scenario_by_name(db, payload.scenario)
    if not scenario:
        raise HTTPException(
            status_code=400, detail=f"Invalid scenario name: {payload.scenario}"
        )

    return schemas.ScenarioResponse(
        scenario=scenario.name,
        projected_sales=float(scenario.projected_sales),
        projected_private_brand_pct=float(scenario.projected_private_brand_pct),
        actions=schemas.ActionSummary(
            grow=scenario.grow_count,
            maintain=scenario.maintain_count,
            swap=scenario.swap_count,
            reduce=scenario.reduce_count,
        ),
        guardrails=schemas.GuardrailSummary(
            pb_penetration=scenario.pb_penetration_status,
            shelf_capacity=scenario.shelf_capacity_status,
        ),
    )


@app.post("/api/v1/reviews", response_model=schemas.ReviewResponse)
def submit_review(payload: schemas.ReviewRequest, db: Session = Depends(get_db)):
    scenario = crud.get_scenario_by_name(db, payload.scenario)
    if not scenario:
        raise HTTPException(
            status_code=400, detail=f"Invalid scenario submission: {payload.scenario}"
        )

    timestamp_str = datetime.utcnow().isoformat() + "Z"
    audit_trail = f"Scenario '{scenario.name}' approved at {timestamp_str} with projected sales impact of +{scenario.projected_sales}% and private brand mix of {scenario.projected_private_brand_pct}%."

    crud.create_review(db, scenario_name=scenario.name, audit_trail=audit_trail)

    return schemas.ReviewResponse(
        success=True,
        approved_scenario=scenario.name,
        audit_trail=audit_trail,
        timestamp=timestamp_str,
    )
