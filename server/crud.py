from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
import uuid
from server.models import Product, Scenario, AssortmentSubmission
from server.schemas import SubmissionRequest


def get_kpis(db: Session):
    # Return the standard KPI values as specified in the WorkSpec
    return {
        "sales_per_linear_ft": 125.50,
        "private_brand_percentage": 15.2,
        "in_stock_rate": 98.5,
        "shelf_capacity": 85.0,
    }


def get_skus(
    db: Session,
    sort_by: Optional[str] = None,
    order: Optional[str] = None,
    filter_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Product]:
    query = db.query(Product)

    if filter_status:
        query = query.filter(Product.status == filter_status)

    if sort_by:
        # Map sort_by parameter to model columns
        col_map = {
            "sales": Product.weekly_sales,
            "weekly_sales": Product.weekly_sales,
            "profit_margin": Product.profit_margin,
            "product_name": Product.product_name,
            "sku_id": Product.sku_id,
            "status": Product.status,
        }
        col = col_map.get(sort_by.lower())
        if col is not None:
            if order and order.lower() == "desc":
                query = query.order_by(desc(col))
            else:
                query = query.order_by(asc(col))
    else:
        # Default stable ordering
        query = query.order_by(asc(Product.sku_id))

    return query.offset(skip).limit(limit).all()


def get_scenarios(db: Session) -> List[Scenario]:
    scenarios = db.query(Scenario).order_by(asc(Scenario.name)).all()

    # Add dynamic guardrails based on scenario name
    for s in scenarios:
        if s.name == "Conservative":
            s.guardrails = [
                {"name": "Supply Chain Capacity", "status": "PASSED"},
                {"name": "Margin Protection", "status": "PASSED"},
                {"name": "Space Constraints", "status": "PASSED"},
                {"name": "Private Brand % goal met", "status": "FAILED"},
            ]
        elif s.name == "Balanced":
            s.guardrails = [
                {"name": "Supply Chain Capacity", "status": "PASSED"},
                {"name": "Margin Protection", "status": "PASSED"},
                {"name": "Space Constraints", "status": "PASSED"},
                {"name": "Private Brand % goal met", "status": "PASSED"},
            ]
        elif s.name == "Aggressive":
            s.guardrails = [
                {"name": "Supply Chain Capacity", "status": "WARNING"},
                {"name": "Margin Protection", "status": "PASSED"},
                {"name": "Space Constraints", "status": "WARNING"},
                {"name": "Private Brand % goal met", "status": "PASSED"},
            ]
    return scenarios


def create_submission(
    db: Session, submission: SubmissionRequest
) -> AssortmentSubmission:
    db_sub = AssortmentSubmission(
        id=str(uuid.uuid4()),
        scenario_name=submission.scenario_name,
        submitted_by=submission.submitted_by,
        submission_details=[action.dict() for action in submission.actions],
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub
