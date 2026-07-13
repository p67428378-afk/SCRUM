import os
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import engine, Base, get_db
from server.models import Product, SKUPerformance, AssortmentScenario, ApprovalLog
from server.schemas import (
    KPIResponse,
    SKUListResponse,
    SKUItem,
    ScenarioResponse,
    SKUActionSummary,
    Guardrails,
    ApprovalRequest,
    ApprovalResponse,
    AuditTrailResponse,
)

# Create tables
Base.metadata.create_all(bind=engine)


def seed_data_db(db: Session):
    # Seed products and performance
    if db.query(Product).count() == 0:
        p1 = Product(
            sku_id="SKU-8821",
            name="Clover Valley Potato Chips 10oz",
            brand_type="Private",
        )
        p2 = Product(
            sku_id="SKU-4412",
            name="Lay's Classic Potato Chips 13oz",
            brand_type="National",
        )
        p3 = Product(
            sku_id="SKU-9015",
            name="Clover Valley Cheese Crackers 12oz",
            brand_type="Private",
        )
        p4 = Product(
            sku_id="SKU-3119", name="Cheez-It Original 12.4oz", brand_type="National"
        )
        p5 = Product(
            sku_id="SKU-1044", name="Generic Tortilla Chips 16oz", brand_type="National"
        )

        db.add_all([p1, p2, p3, p4, p5])
        db.commit()

        perf1 = SKUPerformance(
            product_id=p1.id,
            weekly_sales=1240.00,
            margin_percent=38.5,
            shelf_space='12"',
        )
        perf2 = SKUPerformance(
            product_id=p2.id,
            weekly_sales=2850.00,
            margin_percent=22.0,
            shelf_space='18"',
        )
        perf3 = SKUPerformance(
            product_id=p3.id, weekly_sales=450.00, margin_percent=35.0, shelf_space='8"'
        )
        perf4 = SKUPerformance(
            product_id=p4.id,
            weekly_sales=1980.00,
            margin_percent=24.5,
            shelf_space='14"',
        )
        perf5 = SKUPerformance(
            product_id=p5.id,
            weekly_sales=180.00,
            margin_percent=15.0,
            shelf_space='10"',
        )

        db.add_all([perf1, perf2, perf3, perf4, perf5])
        db.commit()

    # Seed scenarios
    if db.query(AssortmentScenario).count() == 0:
        s1 = AssortmentScenario(
            name="conservative",
            projected_sales_change=2.0,
            projected_private_brand_share=1.0,
            projected_shelf_space_change=0.0,
        )
        s2 = AssortmentScenario(
            name="balanced",
            projected_sales_change=5.0,
            projected_private_brand_share=3.0,
            projected_shelf_space_change=4.0,
        )
        s3 = AssortmentScenario(
            name="aggressive",
            projected_sales_change=9.0,
            projected_private_brand_share=7.0,
            projected_shelf_space_change=12.0,
        )
        db.add_all([s1, s2, s3])
        db.commit()


app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Dollar General category managers",
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


# Helper to map SKU status based on brand and margin
def get_sku_status(sku_id: str) -> str:
    mapping = {
        "SKU-8821": "GROW",
        "SKU-4412": "MAINTAIN",
        "SKU-9015": "GROW",
        "SKU-3119": "SWAP",
        "SKU-1044": "REDUCE",
    }
    return mapping.get(sku_id, "MAINTAIN")


# Helper to get action summary for scenarios
def get_action_summary(scenario_name: str) -> SKUActionSummary:
    if scenario_name.lower() == "conservative":
        return SKUActionSummary(grow=5, maintain=35, reduce=5, swap=3)
    elif scenario_name.lower() == "balanced":
        return SKUActionSummary(grow=12, maintain=24, reduce=4, swap=8)
    else:  # aggressive
        return SKUActionSummary(grow=20, maintain=15, reduce=3, swap=10)


@app.get("/api/v1/kpis", response_model=KPIResponse)
def get_kpis():
    return KPIResponse(
        sales_per_linear_ft=425.5,
        private_brand_share=28.4,
        in_stock_rate=96.8,
        shelf_capacity_utilization=88.2,
    )


@app.get("/api/v1/skus", response_model=SKUListResponse)
def get_skus(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1),
    db: Session = Depends(get_db),
):
    seed_data_db(db)
    offset = (page - 1) * limit
    total = db.query(Product).count()
    products = db.query(Product).offset(offset).limit(limit).all()

    items = []
    for p in products:
        perf = p.performance
        items.append(
            SKUItem(
                sku_id=str(p.sku_id),
                product_name=str(p.name),
                brand_type=str(p.brand_type),
                weekly_sales=float(perf.weekly_sales) if perf else 0.0,
                margin_percent=float(perf.margin_percent) if perf else 0.0,
                shelf_space=str(perf.shelf_space) if perf else '0"',
                status=get_sku_status(str(p.sku_id)),
            )
        )

    return SKUListResponse(items=items, limit=limit, page=page, total=total)


@app.get("/api/v1/scenarios/{scenario_name}", response_model=ScenarioResponse)
def get_scenario(scenario_name: str, db: Session = Depends(get_db)):
    seed_data_db(db)
    scenario = (
        db.query(AssortmentScenario)
        .filter(AssortmentScenario.name == scenario_name.lower())
        .first()
    )
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_name}' not found"
        )

    return ScenarioResponse(
        scenario_name=str(scenario.name),
        projected_sales_change=float(scenario.projected_sales_change),
        projected_private_brand_share=float(scenario.projected_private_brand_share),
        projected_shelf_space_change=float(scenario.projected_shelf_space_change),
        sku_action_summary=get_action_summary(str(scenario.name)),
        guardrails=Guardrails(
            margin_threshold="PASSED",
            private_brand_goal="PASSED",
            shelf_capacity_check="PASSED",
        ),
    )


@app.post("/api/v1/approvals", response_model=ApprovalResponse)
def submit_approval(payload: ApprovalRequest, db: Session = Depends(get_db)):
    seed_data_db(db)
    scenario_name = payload.scenario_name.lower()
    scenario = (
        db.query(AssortmentScenario)
        .filter(AssortmentScenario.name == scenario_name)
        .first()
    )
    if not scenario:
        raise HTTPException(
            status_code=400, detail=f"Invalid scenario name: {payload.scenario_name}"
        )

    txn_id = f"TXN-{uuid.uuid4().hex[:5].upper()}-498"
    summary = get_action_summary(scenario_name)

    log_entry = ApprovalLog(
        transaction_id=txn_id,
        scenario_name=scenario_name,
        user_name="Marcus Vance",
        sku_action_summary=summary.model_dump(),
    )
    db.add(log_entry)
    db.commit()

    return ApprovalResponse(
        success=True,
        message="Assortment Plan Submitted Successfully!",
        transaction_id=txn_id,
        submitted_at=datetime.now(timezone.utc),
        user="Marcus Vance",
    )


@app.get("/api/v1/approvals/{approval_id}", response_model=AuditTrailResponse)
def get_approval(approval_id: str, db: Session = Depends(get_db)):
    seed_data_db(db)
    log_entry = (
        db.query(ApprovalLog).filter(ApprovalLog.transaction_id == approval_id).first()
    )
    if not log_entry:
        raise HTTPException(
            status_code=404, detail=f"Approval ID '{approval_id}' not found"
        )

    return AuditTrailResponse(
        transaction_id=str(log_entry.transaction_id),
        scenario_name=str(log_entry.scenario_name),
        submitted_at=log_entry.submitted_at,
        user_name=str(log_entry.user_name),
        sku_action_summary=SKUActionSummary(**log_entry.sku_action_summary),
    )
