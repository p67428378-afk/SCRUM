import os
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from .database import engine, Base, get_db
from . import models, schemas, crud

# Create tables
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


@app.on_event("startup")
def startup_event():
    # Seed initial SKUs if database is empty
    db = next(get_db())
    try:
        if db.query(models.SKU).count() == 0:
            initial_skus = [
                models.SKU(
                    sku_id="1004592",
                    name="DG CHIPS-SALTED 8OZ",
                    weekly_sales=425.50,
                    profit_margin=38.0,
                    private_brand=True,
                    status="GROW",
                ),
                models.SKU(
                    sku_id="2094411",
                    name="BRAND-X PRETZEL 12OZ",
                    weekly_sales=310.20,
                    profit_margin=25.0,
                    private_brand=False,
                    status="MAINTAIN",
                ),
                models.SKU(
                    sku_id="1003328",
                    name="GENERIC CORN PUFFS 6OZ",
                    weekly_sales=180.00,
                    profit_margin=22.0,
                    private_brand=False,
                    status="SWAP",
                ),
                models.SKU(
                    sku_id="3019924",
                    name="PREMIUM MIX NUTS 10OZ",
                    weekly_sales=85.50,
                    profit_margin=15.0,
                    private_brand=False,
                    status="REDUCE",
                ),
                models.SKU(
                    sku_id="1004610",
                    name="DG CHEESE CURLS 9OZ",
                    weekly_sales=395.00,
                    profit_margin=36.0,
                    private_brand=True,
                    status="GROW",
                ),
            ]
            db.add_all(initial_skus)
            db.commit()
    finally:
        db.close()


@app.get("/api/v1/kpis", response_model=schemas.KPISchema)
def get_kpis(db: Session = Depends(get_db)):
    return crud.get_kpis(db)


@app.get("/api/v1/skus", response_model=schemas.SKUListResponse)
def get_skus(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    items, total = crud.get_skus(
        db,
        page=page,
        per_page=per_page,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return {"items": items, "page": page, "per_page": per_page, "total": total}


@app.get("/api/v1/scenarios/{scenario_name}", response_model=schemas.ScenarioResponse)
def get_scenario(scenario_name: str):
    data = crud.get_scenario_data(scenario_name)
    if not data:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_name}' not found"
        )
    return data


@app.post("/api/v1/assortments", response_model=schemas.AssortmentSubmitResponse)
def submit_assortment(payload: schemas.AssortmentCreate, db: Session = Depends(get_db)):
    try:
        submission = crud.create_assortment_submission(db, payload.scenario_name)
        if not submission:
            raise HTTPException(
                status_code=404, detail=f"Scenario '{payload.scenario_name}' not found"
            )

        # Ensure timestamp is formatted cleanly as ISO 8601 UTC without double timezone suffix
        timestamp_str = submission.created_at.isoformat()
        if timestamp_str.endswith("+00:00"):
            timestamp_str = timestamp_str[:-6] + "Z"
        elif not timestamp_str.endswith("Z"):
            timestamp_str += "Z"

        return {
            "status": submission.status,
            "summary": submission.summary,
            "timestamp": timestamp_str,
            "transaction_id": submission.transaction_id,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get(
    "/api/v1/assortments/{transaction_id}", response_model=schemas.AssortmentResponse
)
def get_assortment(transaction_id: str, db: Session = Depends(get_db)):
    submission = crud.get_submission_by_txn_id(db, transaction_id)
    if not submission:
        raise HTTPException(
            status_code=404, detail=f"Transaction '{transaction_id}' not found"
        )
    return submission
