from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from . import models, schemas, crud
from .database import engine, SessionLocal, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    # Seed SKUs
    db = SessionLocal()
    try:
        crud.seed_skus(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Dollar General category managers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/kpis", response_model=schemas.KpiResponse)
def get_kpis(db: Session = Depends(get_db)):
    # Return standard KPI data
    return {
        "sales_per_linear_ft": {
            "label": "Sales per Linear Ft",
            "value": 145.5,
            "trend": "up",
        },
        "private_brand_pct": {"label": "Private Brand %", "value": 28.4, "trend": "up"},
        "in_stock_rate": {"label": "In-Stock Rate", "value": 96.2, "trend": "down"},
        "shelf_capacity": {"label": "Shelf Capacity", "value": 88.0, "trend": "stable"},
    }


@app.get("/api/v1/skus", response_model=List[schemas.SkuResponse])
def get_skus(
    search: Optional[str] = Query(None, description="Search query for SKU name"),
    status: Optional[str] = Query(
        None, description="Filter by status (GROW, MAINTAIN, SWAP, REDUCE)"
    ),
    db: Session = Depends(get_db),
):
    skus = crud.get_skus(db, search=search, status=status)
    return skus


@app.get("/api/v1/scenarios/{scenario_name}", response_model=schemas.ScenarioResponse)
def get_scenario(scenario_name: str, db: Session = Depends(get_db)):
    name_lower = scenario_name.lower()
    if name_lower not in ["conservative", "balanced", "aggressive"]:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_name}' not found"
        )

    # Fetch SKUs to build dynamic skus_to_action list
    skus = crud.get_skus(db)
    skus_to_action: List[Dict[str, Any]] = []

    if skus:
        # Map SKUs to actions based on scenario
        if name_lower == "conservative":
            # Conservative scenario: fewer actions, low risk
            for i, sku in enumerate(skus[:3]):
                action = "GROW" if i == 0 else "MAINTAIN"
                skus_to_action.append(
                    {"id": sku.id, "name": sku.name, "action": action}
                )
        elif name_lower == "balanced":
            # Balanced scenario: recommended actions
            for i, sku in enumerate(skus[:4]):
                action = "GROW" if i % 2 == 0 else "SWAP"
                skus_to_action.append(
                    {"id": sku.id, "name": sku.name, "action": action}
                )
        else:
            # Aggressive scenario: more actions, higher risk
            for i, sku in enumerate(skus):
                action = "GROW" if i % 3 == 0 else ("REDUCE" if i % 3 == 1 else "SWAP")
                skus_to_action.append(
                    {"id": sku.id, "name": sku.name, "action": action}
                )

    # Scenario-specific metrics
    if name_lower == "conservative":
        return {
            "name": "conservative",
            "projected_sales_impact": 2.1,
            "projected_private_brand_impact": 0.7,
            "sku_action_summary": {"grow": 2, "maintain": 20, "reduce": 1, "swap": 2},
            "guardrails": {
                "private_brand_goal_met": True,
                "shelf_space_limit_ok": True,
            },
            "skus_to_action": skus_to_action,
        }
    elif name_lower == "balanced":
        return {
            "name": "balanced",
            "projected_sales_impact": 4.2,
            "projected_private_brand_impact": 1.5,
            "sku_action_summary": {"grow": 5, "maintain": 15, "reduce": 2, "swap": 3},
            "guardrails": {
                "private_brand_goal_met": True,
                "shelf_space_limit_ok": True,
            },
            "skus_to_action": skus_to_action,
        }
    else:
        return {
            "name": "aggressive",
            "projected_sales_impact": 8.9,
            "projected_private_brand_impact": 2.5,
            "sku_action_summary": {"grow": 10, "maintain": 10, "reduce": 5, "swap": 5},
            "guardrails": {
                "private_brand_goal_met": False,
                "shelf_space_limit_ok": True,
            },
            "skus_to_action": skus_to_action,
        }


@app.post("/api/v1/assortment-reviews", response_model=schemas.AssortmentReviewResponse)
def create_assortment_review(
    review_in: schemas.AssortmentReviewCreate, db: Session = Depends(get_db)
):
    # Validate scenario name
    if review_in.scenario_name.lower() not in [
        "conservative",
        "balanced",
        "aggressive",
    ]:
        raise HTTPException(status_code=400, detail="Invalid scenario name")

    # Convert submission data to dict
    submission_dict = review_in.submission_data.dict()

    # Create review
    db_review = crud.create_assortment_review(
        db=db, scenario_name=review_in.scenario_name, submission_data=submission_dict
    )

    return {
        "id": db_review.id,
        "scenario_name": db_review.scenario_name,
        "user_id": db_review.user_id,
        "submission_data": db_review.submission_data,
        "audit_id": db_review.audit_id,
        "status": "SUCCESS",
        "created_at": db_review.created_at,
    }
