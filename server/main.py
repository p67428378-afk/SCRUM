import os
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from . import models, schemas, crud
from .database import engine, get_db

# Import models to ensure they are registered on Base

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

# Create tables on startup
models.Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def on_startup():
    # Ensure tables are created in the current DB session
    models.Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        crud.seed_initial_data(db)
    finally:
        db.close()


@app.get("/api/v1/kpis", response_model=schemas.KPISummary)
def read_kpis(db: Session = Depends(get_db)):
    try:
        return crud.get_kpis(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )


@app.get("/api/v1/sku-performance", response_model=schemas.SKUPerformanceResponse)
def read_sku_performance(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        return crud.get_sku_performance(
            db,
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid query parameters or database error: {str(e)}",
        )


@app.get("/api/v1/scenarios/{scenario_name}", response_model=schemas.ScenarioResponse)
def read_scenario(scenario_name: str, db: Session = Depends(get_db)):
    scenario = crud.get_scenario(db, scenario_name)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_name}' not found",
        )
    return scenario


@app.post(
    "/api/v1/assortment-plans",
    response_model=schemas.AssortmentPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_plan(plan: schemas.AssortmentPlanCreate, db: Session = Depends(get_db)):
    # Simple guardrail check: e.g., if shelf capacity is over 100%
    # In a real app, we would check the scenario details or plan details
    if (
        plan.scenario_name.lower() == "aggressive"
        and plan.plan_details.get("bypass_guardrails") is False
    ):
        # Mock a guardrail violation if requested
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Critical guardrail violation: Projected shelf capacity exceeds 95% limit.",
        )

    try:
        return crud.create_assortment_plan(db, plan)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan details or database error: {str(e)}",
        )
