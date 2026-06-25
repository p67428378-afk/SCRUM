"""
Module: crud
Purpose: Database CRUD operations.
"""
from sqlalchemy.orm import Session
from server.models import AssortmentSubmissionLog
from server.schemas import AssortmentSubmitRequest

def create_submission_log(db: Session, request: AssortmentSubmitRequest) -> AssortmentSubmissionLog:
    """
    Create a new assortment submission log entry.
    Note: The route handler owns the commit, so we only add and flush here.
    """
    # Convert Pydantic models to dicts for JSON storage
    sku_actions_list = [action.model_dump() for action in request.sku_actions]
    
    db_obj = AssortmentSubmissionLog(
        scenario_name=request.scenario_name,
        submitted_by=request.submitted_by,
        sku_actions=sku_actions_list,
    )
    db.add(db_obj)
    db.flush()  # Flush to populate the ID and timestamps
    return db_obj

def get_submission_logs(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve submission logs with pagination and stable ordering.
    """
    return (
        db.query(AssortmentSubmissionLog)
        .order_by(AssortmentSubmissionLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
