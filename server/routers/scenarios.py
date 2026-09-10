from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import ClusterMetric, ScenarioConfig
from server.schemas import (
    GuardrailCheckRequest,
    GuardrailCheckResponse,
    GuardrailItem,
    RecommendedActions,
    ScenarioConfigResponse,
    ScenarioEvaluateRequest,
    ScenarioEvaluateResponse,
)

router = APIRouter(prefix="/api/v1", tags=["scenarios", "guardrails"])


@router.get("/scenarios", response_model=List[ScenarioConfigResponse])
def list_scenarios(db: Session = Depends(get_db)):
    configs = db.query(ScenarioConfig).all()
    results = []
    for c in configs:
        results.append(
            ScenarioConfigResponse(
                id=c.id,
                scenario_type=c.scenario_type,
                description=c.description,
                projected_sales_lift_pct=c.projected_sales_lift_pct,
                projected_pb_share_pct=c.projected_pb_share_pct,
                projected_capacity_pct=c.projected_capacity_pct,
                is_default=c.is_default,
                recommended_actions=RecommendedActions(
                    GROW=c.grow_count,
                    MAINTAIN=c.maintain_count,
                    SWAP=c.swap_count,
                    REDUCE=c.reduce_count
                )
            )
        )
    return results


@router.post("/scenarios/evaluate", response_model=ScenarioEvaluateResponse)
def evaluate_scenario(payload: ScenarioEvaluateRequest, db: Session = Depends(get_db)):
    # Standardize scenario name lookup
    scenario_name = payload.scenario_type.strip().capitalize()
    if scenario_name.lower().startswith("cons"):
        scenario_name = "Conservative"
    elif scenario_name.lower().startswith("bal"):
        scenario_name = "Balanced"
    elif scenario_name.lower().startswith("agg"):
        scenario_name = "Aggressive"

    config = db.query(ScenarioConfig).filter(
        ScenarioConfig.scenario_type.ilike(f"%{scenario_name}%")
    ).first()

    if not config:
        # Defaults if not found
        if scenario_name == "Conservative":
            return ScenarioEvaluateResponse(
                scenario_type="Conservative",
                projected_sales_lift_pct=1.80,
                projected_pb_share_pct=26.50,
                projected_capacity_pct=81.00,
                recommended_actions=RecommendedActions(GROW=6, MAINTAIN=16, SWAP=4, REDUCE=2)
            )
        elif scenario_name == "Aggressive":
            return ScenarioEvaluateResponse(
                scenario_type="Aggressive",
                projected_sales_lift_pct=7.20,
                projected_pb_share_pct=32.50,
                projected_capacity_pct=92.00,
                recommended_actions=RecommendedActions(GROW=14, MAINTAIN=8, SWAP=5, REDUCE=2)
            )
        else:
            return ScenarioEvaluateResponse(
                scenario_type="Balanced",
                projected_sales_lift_pct=4.60,
                projected_pb_share_pct=28.00,
                projected_capacity_pct=85.00,
                recommended_actions=RecommendedActions(GROW=12, MAINTAIN=10, SWAP=4, REDUCE=2)
            )

    return ScenarioEvaluateResponse(
        scenario_type=config.scenario_type,
        projected_sales_lift_pct=config.projected_sales_lift_pct,
        projected_pb_share_pct=config.projected_pb_share_pct,
        projected_capacity_pct=config.projected_capacity_pct,
        recommended_actions=RecommendedActions(
            GROW=config.grow_count,
            MAINTAIN=config.maintain_count,
            SWAP=config.swap_count,
            REDUCE=config.reduce_count
        )
    )


@router.post("/guardrails/check", response_model=GuardrailCheckResponse)
def check_guardrails(payload: GuardrailCheckRequest, db: Session = Depends(get_db)):
    # Determine base values
    pb_share = payload.projected_pb_share_pct
    capacity = payload.projected_capacity_pct
    in_stock = payload.in_stock_rate

    # If not provided, fetch from scenario or cluster
    if pb_share is None or capacity is None:
        scenario_name = (payload.scenario_type or "Balanced").strip().capitalize()
        config = db.query(ScenarioConfig).filter(
            ScenarioConfig.scenario_type.ilike(f"%{scenario_name}%")
        ).first()
        if config:
            if pb_share is None:
                pb_share = config.projected_pb_share_pct
            if capacity is None:
                capacity = config.projected_capacity_pct
        else:
            if pb_share is None:
                pb_share = 28.00
            if capacity is None:
                capacity = 85.00

    if in_stock is None:
        metric = db.query(ClusterMetric).first()
        in_stock = metric.in_stock_rate if metric else 96.50

    checks: List[GuardrailItem] = []

    # Rule 1: Private Brand Share >= 25%
    pb_status = "PASSED" if pb_share >= 25.0 else ("WARNING" if pb_share >= 20.0 else "FAILED")
    checks.append(
        GuardrailItem(
            rule="Private Brand Share >= 25%",
            status=pb_status,
            actual_value=f"{pb_share:.2f}%"
        )
    )

    # Rule 2: Shelf Capacity Utilization <= 100%
    cap_status = "PASSED" if capacity <= 100.0 else "FAILED"
    checks.append(
        GuardrailItem(
            rule="Shelf Capacity Utilization <= 100%",
            status=cap_status,
            actual_value=f"{capacity:.2f}%"
        )
    )

    # Rule 3: In-Stock Rate >= 95%
    stock_status = "PASSED" if in_stock >= 95.0 else ("WARNING" if in_stock >= 90.0 else "FAILED")
    checks.append(
        GuardrailItem(
            rule="In-Stock Rate >= 95%",
            status=stock_status,
            actual_value=f"{in_stock:.2f}%"
        )
    )

    # Overall Status calculation
    if any(c.status == "FAILED" for c in checks):
        overall_status = "FAILED"
    elif any(c.status == "WARNING" for c in checks):
        overall_status = "WARNING"
    else:
        overall_status = "PASSED"

    return GuardrailCheckResponse(
        overall_status=overall_status,
        checks=checks
    )
