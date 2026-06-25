from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from server.database import get_db
from server.schemas import (
    KPISchema,
    SKUSchema,
    ScenarioSchema,
    ReviewCreateSchema,
    ReviewResponseSchema,
)
from server.crud import get_kpis, get_skus, get_scenario, create_review

router = APIRouter(prefix="/api/v1")


@router.get("/kpis", response_model=KPISchema)
def read_kpis(db: Session = Depends(get_db)):
    try:
        return get_kpis(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs while fetching KPIs: {str(e)}",
        )


@router.get("/skus", response_model=List[SKUSchema])
def read_skus(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    db: Session = Depends(get_db),
):
    try:
        return get_skus(db, search=search, sort_by=sort_by, sort_order=sort_order)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs while fetching SKUs: {str(e)}",
        )


@router.get("/scenarios/{scenario_name}", response_model=ScenarioSchema)
def read_scenario(scenario_name: str):
    scenario = get_scenario(scenario_name)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_name}' is invalid or not found",
        )
    return scenario


@router.post("/reviews", response_model=ReviewResponseSchema)
def submit_review(review_in: ReviewCreateSchema, db: Session = Depends(get_db)):
    try:
        # Validate scenario name
        scenario_data = get_scenario(review_in.selected_scenario)
        if not scenario_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scenario name: {review_in.selected_scenario}",
            )

        # Convert Pydantic models to dicts for storage
        sku_actions_dict = [action.dict() for action in review_in.sku_actions]

        # Create review and audit log
        review, audit = create_review(
            db=db,
            selected_scenario=review_in.selected_scenario,
            sku_actions=sku_actions_dict,
        )

        # Generate transaction ID
        transaction_id = f"TX-{uuid.uuid4().hex[:9].upper()}"

        return {
            "message": f"Assortment for Small Town Value Cluster submitted based on {review_in.selected_scenario} scenario with {len(review_in.sku_actions)} SKU changes.",
            "status": "SUCCESS",
            "submitted_at": datetime.utcnow().isoformat() + "Z",
            "transaction_id": transaction_id,
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error occurs during submission: {str(e)}",
        )
