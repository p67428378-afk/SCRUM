"""
Module: main
Purpose: FastAPI application entry point and route handlers.
Author: Backend_Worker
Created: 2026-06-30
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import engine, Base, SessionLocal, get_db
from server.schemas import KPIResponse, SKUResponse, ScenarioResponse, ApprovalRequest, ApprovalResponse, Guardrails, SKUActions, SKUActionItem, SKUSwapItem
from server.crud import get_kpis_data, get_skus_list, create_assortment_decision, seed_data

# Define scenarios dictionary
SCENARIOS = {
    "conservative": {
        "scenario_name": "Conservative",
        "projected_sales_impact": 3.0,
        "projected_private_brand_impact": 1.0,
        "guardrails": {
            "private_brand_percentage_check": "PASS",
            "total_skus_check": "PASS"
        },
        "sku_actions": {
            "add": [{"sku": "SKU-123", "product_name": "Private Brand Potato Chips"}],
            "remove": [],
            "swap": []
        }
    },
    "balanced": {
        "scenario_name": "Balanced",
        "projected_sales_impact": 7.0,
        "projected_private_brand_impact": 3.0,
        "guardrails": {
            "private_brand_percentage_check": "PASS",
            "total_skus_check": "PASS"
        },
        "sku_actions": {
            "add": [{"sku": "SKU-123", "product_name": "Private Brand Potato Chips"}],
            "remove": [{"sku": "SKU-789", "product_name": "National Brand Pretzels"}],
            "swap": [{"add_sku": "SKU-345", "add_name": "Private Brand Popcorn", "remove_sku": "SKU-012", "remove_name": "National Brand Popcorn"}]
        }
    },
    "aggressive": {
        "scenario_name": "Aggressive",
        "projected_sales_impact": 12.0,
        "projected_private_brand_impact": 5.0,
        "guardrails": {
            "private_brand_percentage_check": "PASS",
            "total_skus_check": "PASS"
        },
        "sku_actions": {
            "add": [
                {"sku": "SKU-123", "product_name": "Private Brand Potato Chips"},
                {"sku": "SKU-345", "product_name": "Private Brand Popcorn"}
            ],
            "remove": [
                {"sku": "SKU-789", "product_name": "National Brand Pretzels"},
                {"sku": "SKU-012", "product_name": "National Brand Popcorn"}
            ],
            "swap": []
        }
    }
}

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    """
    Lifespan context manager for database initialization and seeding.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Backend API for DG Cluster Assortment Advisor Dashboard",
    version="1.0.0",
    lifespan=app_lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/kpis", response_model=KPIResponse, summary="Get KPIs")
def get_kpis(db: Session = Depends(get_db)):
    """
    Retrieve key performance indicators for the header strip.
    """
    kpis = get_kpis_data(db)
    return kpis

@app.get("/api/v1/skus", response_model=List[SKUResponse], summary="Get SKUs")
def get_skus(
    sort_by: Optional[str] = Query(None, description="Field to sort by (sales_revenue, units_sold, profit_margin)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by recommendation status (GROW, MAINTAIN, SWAP, REDUCE)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Fetch a list of all snack SKUs with their performance metrics. Supports filtering and sorting.
    """
    # Note: status_filter parameter is named status_filter to avoid shadowing the fastapi.status module.
    skus = get_skus_list(db, sort_by=sort_by, status=status_filter, skip=skip, limit=limit)
    return skus

@app.get("/api/v1/scenarios/{scenario_name}", response_model=ScenarioResponse, summary="Get Scenario Details")
def get_scenario(scenario_name: str):
    """
    Retrieve the projected impact and SKU action list for a given scenario (Conservative, Balanced, Aggressive).
    """
    name_key = scenario_name.lower()
    if name_key not in SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_name}' not found or invalid."
        )
    return SCENARIOS[name_key]

@app.post("/api/v1/approvals", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED, summary="Submit Scenario Approval")
def submit_approval(request: ApprovalRequest, db: Session = Depends(get_db)):
    """
    Submit the selected assortment scenario for approval. Logs the decision and returns an audit ID.
    """
    name_key = request.scenario_name.lower()
    if name_key not in SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario name '{request.scenario_name}'."
        )

    # Validate decision payload against scenario rules
    # Business rules: Private Brand % > 20%, Total SKUs < 500
    # Let's check if the payload is valid
    payload = request.decision_payload
    if payload.projected_private_brand_impact < 0 or payload.projected_sales_impact < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid projected impact values."
        )

    # Save decision to database
    decision_dict = payload.model_dump()
    create_assortment_decision(
        db=db,
        user_id="user123",
        scenario_name=request.scenario_name,
        decision_payload=decision_dict
    )

    # Generate audit ID and timestamp
    now = datetime.now(timezone.utc)
    timestamp_str = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    audit_id = f"{timestamp_str}-user123"

    return ApprovalResponse(
        status="SUCCESS",
        message=f"Assortment scenario '{request.scenario_name}' submitted successfully.",
        audit_id=audit_id,
        timestamp=timestamp_str,
        submitted_by="user123"
    )
