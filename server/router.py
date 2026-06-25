from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from server.database import get_db
from server.schemas import (
    KPIResponse,
    SKUResponse,
    ScenarioResponse,
    ReviewRequest,
    ReviewResponse,
)
from server import crud

router = APIRouter(prefix="/api/v1")

SCENARIOS = {
    "conservative": {
        "scenario_name": "Conservative",
        "projected_sales_impact": 1.2,
        "projected_pb_pct": 22.9,
        "sku_actions": [
            {"sku_id": "SKU-1001", "action": "GROW"},
            {"sku_id": "SKU-1002", "action": "REDUCE"},
            {"sku_id": "SKU-1045", "action": "GROW"},
            {"sku_id": "SKU-2099", "action": "MAINTAIN"},
            {"sku_id": "SKU-1050", "action": "MAINTAIN"},
            {"sku_id": "SKU-3122", "action": "MAINTAIN"},
            {"sku_id": "SKU-1088", "action": "REDUCE"},
        ],
        "guardrails": [
            {"name": "Private Brand % goal", "status": "MET"},
            {"name": "Shelf Capacity limit", "status": "MET"},
            {"name": "In-Stock Risk", "status": "MET"},
        ],
    },
    "balanced": {
        "scenario_name": "Balanced",
        "projected_sales_impact": 3.5,
        "projected_pb_pct": 24.5,
        "sku_actions": [
            {"sku_id": "SKU-1001", "action": "GROW"},
            {"sku_id": "SKU-1002", "action": "REDUCE"},
            {"sku_id": "SKU-1045", "action": "GROW"},
            {"sku_id": "SKU-2099", "action": "MAINTAIN"},
            {"sku_id": "SKU-1050", "action": "GROW"},
            {"sku_id": "SKU-3122", "action": "SWAP"},
            {"sku_id": "SKU-1088", "action": "REDUCE"},
        ],
        "guardrails": [
            {"name": "Private Brand % goal", "status": "MET"},
            {"name": "Shelf Capacity limit", "status": "MET"},
            {"name": "In-Stock Risk", "status": "MET"},
        ],
    },
    "aggressive": {
        "scenario_name": "Aggressive",
        "projected_sales_impact": 5.8,
        "projected_pb_pct": 26.4,
        "sku_actions": [
            {"sku_id": "SKU-1001", "action": "GROW"},
            {"sku_id": "SKU-1002", "action": "REDUCE"},
            {"sku_id": "SKU-1045", "action": "GROW"},
            {"sku_id": "SKU-2099", "action": "REDUCE"},
            {"sku_id": "SKU-1050", "action": "GROW"},
            {"sku_id": "SKU-3122", "action": "SWAP"},
            {"sku_id": "SKU-1088", "action": "REDUCE"},
        ],
        "guardrails": [
            {"name": "Private Brand % goal", "status": "MET"},
            {"name": "Shelf Capacity limit", "status": "MET"},
            {"name": "In-Stock Risk", "status": "MET"},
        ],
    },
}


@router.get("/kpis", response_model=KPIResponse)
def read_kpis(db: Session = Depends(get_db)):
    try:
        return crud.get_kpis(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs while fetching KPIs: {str(e)}",
        )


@router.get("/skus", response_model=List[SKUResponse])
def read_skus(db: Session = Depends(get_db)):
    try:
        return crud.get_skus(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs while fetching SKUs: {str(e)}",
        )


@router.get("/scenarios/{scenario_name}", response_model=ScenarioResponse)
def read_scenario(scenario_name: str):
    key = scenario_name.lower()
    if key not in SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario name '{scenario_name}' is invalid or not found",
        )
    return SCENARIOS[key]


@router.post("/reviews", response_model=ReviewResponse)
def submit_review(review_req: ReviewRequest, db: Session = Depends(get_db)):
    try:
        # Validate scenario name
        if review_req.selected_scenario.lower() not in SCENARIOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scenario: {review_req.selected_scenario}",
            )

        # Create review and audit log
        crud.create_review(db, review_req)

        # Generate transaction ID
        txn_id = f"TX-{uuid.uuid4().hex[:9].upper()}"

        return ReviewResponse(
            message=f"Assortment for Small Town Value Cluster submitted based on {review_req.selected_scenario} scenario with {len(review_req.sku_actions)} SKU changes.",
            status="SUCCESS",
            submitted_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            transaction_id=txn_id,
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs during submission: {str(e)}",
        )
