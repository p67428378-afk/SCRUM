from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from . import models
import uuid
import datetime


def get_kpis(db: Session):
    # Calculate KPIs dynamically based on SKUs in the database
    skus = db.query(models.SKU).all()
    if not skus:
        return {
            "sales_per_linear_ft": 15.75,
            "private_brand_pct": 22.0,
            "in_stock_rate": 94.2,
            "shelf_capacity": 85.0,
        }

    total_sales = sum(float(sku.weekly_sales) for sku in skus)
    pb_count = sum(1 for sku in skus if sku.private_brand)
    total_count = len(skus)

    # Mock linear feet as 100 for calculation
    sales_per_linear_ft = round(total_sales / 100.0, 2) if total_count > 0 else 0.0
    private_brand_pct = (
        round((pb_count / total_count) * 100.0, 1) if total_count > 0 else 0.0
    )

    return {
        "sales_per_linear_ft": sales_per_linear_ft,
        "private_brand_pct": private_brand_pct,
        "in_stock_rate": 94.2,  # Standard baseline
        "shelf_capacity": 85.0,  # Standard baseline
    }


def get_skus(
    db: Session,
    page: int = 1,
    per_page: int = 50,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
):
    query = db.query(models.SKU)

    if search:
        query = query.filter(
            or_(
                models.SKU.sku_id.ilike(f"%{search}%"),
                models.SKU.name.ilike(f"%{search}%"),
                models.SKU.status.ilike(f"%{search}%"),
            )
        )

    if sort_by:
        col = getattr(models.SKU, sort_by, None)
        if col is not None:
            if sort_order == "desc":
                query = query.order_by(col.desc())
            else:
                query = query.order_by(col.asc())
    else:
        query = query.order_by(models.SKU.sku_id.asc())

    total = query.count()
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return items, total


def get_scenario_data(scenario_name: str):
    name_lower = scenario_name.lower()
    if name_lower == "conservative":
        return {
            "scenario_name": "Conservative",
            "projected_sales_change_pct": 1.2,
            "projected_private_brand_pct": 21.5,
            "projected_shelf_capacity": 80.0,
            "actions_summary": {"adds": 2, "removals": 2, "swaps": 2},
            "guardrails": [
                {
                    "name": "Private Brand Minimum (20%)",
                    "status": "PASS",
                    "value": "PASS (21.5%)",
                },
                {
                    "name": "Shelf Capacity Optimization",
                    "status": "PASS",
                    "value": "PASS (80.0%)",
                },
                {
                    "name": "In-Stock Risk Tolerance",
                    "status": "PASS",
                    "value": "PASS (Low Risk)",
                },
            ],
        }
    elif name_lower == "balanced":
        return {
            "scenario_name": "Balanced",
            "projected_sales_change_pct": 3.5,
            "projected_private_brand_pct": 22.0,
            "projected_shelf_capacity": 85.0,
            "actions_summary": {"adds": 3, "removals": 4, "swaps": 8},
            "guardrails": [
                {
                    "name": "Private Brand Minimum (20%)",
                    "status": "PASS",
                    "value": "PASS (22.0%)",
                },
                {
                    "name": "Shelf Capacity Optimization",
                    "status": "PASS",
                    "value": "PASS (85.0%)",
                },
                {
                    "name": "In-Stock Risk Tolerance",
                    "status": "PASS",
                    "value": "PASS (Low Risk)",
                },
            ],
        }
    elif name_lower == "aggressive":
        return {
            "scenario_name": "Aggressive",
            "projected_sales_change_pct": 6.8,
            "projected_private_brand_pct": 18.5,
            "projected_shelf_capacity": 92.0,
            "actions_summary": {"adds": 8, "removals": 6, "swaps": 15},
            "guardrails": [
                {
                    "name": "Private Brand Minimum (20%)",
                    "status": "FAIL",
                    "value": "FAIL (18.5%)",
                },
                {
                    "name": "Shelf Capacity Optimization",
                    "status": "PASS",
                    "value": "PASS (92.0%)",
                },
                {
                    "name": "In-Stock Risk Tolerance",
                    "status": "FAIL",
                    "value": "FAIL (High Risk)",
                },
            ],
        }
    return None


def create_assortment_submission(db: Session, scenario_name: str):
    scenario_data = get_scenario_data(scenario_name)
    if not scenario_data:
        return None

    # Check guardrails
    for g in scenario_data["guardrails"]:
        if g["status"] == "FAIL":
            raise ValueError(f"Guardrail check failed: {g['name']}")

    txn_id = f"TXN-496-{uuid.uuid4().hex[:6].upper()}"
    summary = f"Approved {scenario_data['scenario_name']} scenario. Actions: {scenario_data['actions_summary']['adds']} Adds, {scenario_data['actions_summary']['swaps']} Swaps, {scenario_data['actions_summary']['removals']} Removals."

    submission = models.AssortmentSubmission(
        transaction_id=txn_id,
        scenario_name=scenario_data["scenario_name"],
        status="APPROVED",
        summary=summary,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Seed some mock actions
    actions = []
    for i in range(scenario_data["actions_summary"]["adds"]):
        action = models.AssortmentSubmissionAction(
            submission_id=submission.id, sku_id=f"ADD-SKU-{i + 1}", action_type="ADD"
        )
        db.add(action)
        actions.append(action)

    for i in range(scenario_data["actions_summary"]["swaps"]):
        action = models.AssortmentSubmissionAction(
            submission_id=submission.id, sku_id=f"SWAP-SKU-{i + 1}", action_type="SWAP"
        )
        db.add(action)
        actions.append(action)

    for i in range(scenario_data["actions_summary"]["removals"]):
        action = models.AssortmentSubmissionAction(
            submission_id=submission.id,
            sku_id=f"REMOVE-SKU-{i + 1}",
            action_type="REMOVE",
        )
        db.add(action)
        actions.append(action)

    db.commit()
    return submission


def get_submission_by_txn_id(db: Session, transaction_id: str):
    return (
        db.query(models.AssortmentSubmission)
        .filter(models.AssortmentSubmission.transaction_id == transaction_id)
        .first()
    )
