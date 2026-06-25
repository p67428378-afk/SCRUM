"""
Module: router
Purpose: FastAPI router defining the API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import (
    DashboardResponse,
    AssortmentSubmitRequest,
    AssortmentSubmitResponse,
)
from server import crud

router = APIRouter(prefix="/api/v1/assortment", tags=["assortment"])

# Static mock data matching the WorkSpec exactly
DASHBOARD_DATA = {
    "kpis": {
        "sales_per_linear_ft": 250.0,
        "private_brand_pct": 18.0,
        "in_stock_rate": 95.5,
        "shelf_capacity": 85.0,
    },
    "skus": [
        {
            "sku": "SKU-1001",
            "name": "Lay's Classic 8oz",
            "sales": 12500.0,
            "units": 3500,
            "margin": 0.35,
            "days_of_supply": 12,
            "private_brand": False,
            "status": "GROW",
        },
        {
            "sku": "SKU-1002",
            "name": "Clover Valley Potato Chips 8oz",
            "sales": 8500.0,
            "units": 2800,
            "margin": 0.45,
            "days_of_supply": 15,
            "private_brand": True,
            "status": "MAINTAIN",
        },
    ],
    "scenarios": {
        "conservative": {
            "name": "Conservative",
            "projected_sales_impact": 1.02,
            "projected_private_brand_pct": 21.0,
            "projected_shelf_capacity": 82.0,
            "guardrails": {
                "private_brand_check": "PASS",
                "shelf_capacity_check": "PASS",
            },
            "sku_actions": [
                {"sku": "SKU-1001", "action": "MAINTAIN"},
                {"sku": "SKU-1002", "action": "GROW"},
            ],
        },
        "balanced": {
            "name": "Balanced",
            "projected_sales_impact": 1.05,
            "projected_private_brand_pct": 22.5,
            "projected_shelf_capacity": 84.0,
            "guardrails": {
                "private_brand_check": "PASS",
                "shelf_capacity_check": "PASS",
            },
            "sku_actions": [
                {"sku": "SKU-1001", "action": "GROW"},
                {"sku": "SKU-1002", "action": "MAINTAIN"},
            ],
        },
        "aggressive": {
            "name": "Aggressive",
            "projected_sales_impact": 1.12,
            "projected_private_brand_pct": 19.0,
            "projected_shelf_capacity": 89.0,
            "guardrails": {
                "private_brand_check": "FAIL",
                "shelf_capacity_check": "PASS",
            },
            "sku_actions": [
                {"sku": "SKU-1001", "action": "GROW"},
                {"sku": "SKU-1002", "action": "SWAP"},
            ],
        },
    },
}

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    """
    Fetch KPI and SKU performance data.
    """
    return DASHBOARD_DATA

@router.post("/submit", response_model=AssortmentSubmitResponse, status_code=status.HTTP_201_CREATED)
def submit_assortment(request: AssortmentSubmitRequest, db: Session = Depends(get_db)):
    """
    Submit the selected scenario details.
    Validates guardrails (Private Brand % >= 20%).
    """
    # Guardrail validation: Private Brand % must be >= 20%
    # We check if the scenario is Aggressive or if the projected private brand % is < 20%
    scenario_key = request.scenario_name.lower()
    
    # If it's a known scenario, check its projected private brand %
    if scenario_key in DASHBOARD_DATA["scenarios"]:
        projected_pb = DASHBOARD_DATA["scenarios"][scenario_key]["projected_private_brand_pct"]
        if projected_pb < 20.0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Guardrail validation failed: Private Brand % ({projected_pb}%) must be >= 20%"
            )
    elif scenario_key == "aggressive":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guardrail validation failed: Private Brand % must be >= 20%"
        )

    try:
        db_obj = crud.create_submission_log(db, request)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database write failed: {str(e)}"
        )
