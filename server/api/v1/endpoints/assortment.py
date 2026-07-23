from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from server.database import get_db
from server.schemas import (
    KPIResponse,
    SKUResponse,
    ScenarioResponse,
    SubmissionRequest,
    SubmissionResponse,
)
from server import crud

router = APIRouter()


@router.get(
    "/kpis",
    response_model=KPIResponse,
    description="Retrieves the four main KPI values for the header strip.",
)
def read_kpis(db: Session = Depends(get_db)):
    try:
        kpis = crud.get_kpis(db)
        return kpis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}",
        )


@router.get(
    "/skus",
    response_model=List[SKUResponse],
    description="Retrieves the list of all snack SKUs with their performance data.",
)
def read_skus(
    sort_by: Optional[str] = None,
    order: Optional[str] = None,
    filter_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    try:
        skus = crud.get_skus(
            db,
            sort_by=sort_by,
            order=order,
            filter_status=filter_status,
            skip=skip,
            limit=limit,
        )
        return skus
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}",
        )


@router.get(
    "/scenarios",
    response_model=List[ScenarioResponse],
    description="Retrieves the projected impact metrics for each of the three predefined scenarios.",
)
def read_scenarios(db: Session = Depends(get_db)):
    try:
        scenarios = crud.get_scenarios(db)
        return scenarios
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}",
        )


@router.post(
    "/submit",
    response_model=SubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    description="Submits the category manager's chosen assortment scenario for approval and auditing.",
)
def submit_assortment(submission: SubmissionRequest, db: Session = Depends(get_db)):
    # Guardrail check: scenario_name must be one of Conservative, Balanced, Aggressive
    if submission.scenario_name not in ["Conservative", "Balanced", "Aggressive"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scenario name. Must be Conservative, Balanced, or Aggressive.",
        )

    # Guardrail check: actions list must not be empty
    if not submission.actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Actions list cannot be empty.",
        )

    try:
        db_sub = crud.create_submission(db, submission)
        return SubmissionResponse(
            submission_id=db_sub.id, status="SUBMITTED", timestamp=db_sub.created_at
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Bad Request: {str(e)}"
        )
