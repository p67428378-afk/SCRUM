import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.location import Location
from server.models.alert import AlertConfig, NotificationLog
from server.schemas.alert import (
    AlertConfigCreate,
    AlertConfigResponse,
    AlertNotificationResponse,
)

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.post(
    "/configs", response_model=AlertConfigResponse, status_code=status.HTTP_201_CREATED
)
def create_alert_config(config_in: AlertConfigCreate, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == config_in.location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{config_in.location_id}' not found.",
        )

    m_upper = config_in.metric_type.upper()
    valid_metrics = ["TEMPERATURE", "WIND_SPEED", "PRECIPITATION", "UV_INDEX"]
    if m_upper not in valid_metrics:
        if "TEMP" in m_upper:
            m_upper = "TEMPERATURE"
        elif "WIND" in m_upper:
            m_upper = "WIND_SPEED"
        elif "PRECIP" in m_upper or "RAIN" in m_upper:
            m_upper = "PRECIPITATION"
        elif "UV" in m_upper:
            m_upper = "UV_INDEX"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid metric_type. Allowed: {valid_metrics}",
            )

    op_upper = config_in.operator.upper()
    valid_ops = ["GREATER_THAN", "LESS_THAN", "EQUALS"]
    if op_upper not in valid_ops:
        if op_upper in (">", "GTE", ">="):
            op_upper = "GREATER_THAN"
        elif op_upper in ("<", "LTE", "<="):
            op_upper = "LESS_THAN"
        elif op_upper in ("==", "="):
            op_upper = "EQUALS"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid operator. Allowed: {valid_ops}",
            )

    now_utc = datetime.now(timezone.utc)
    new_cfg = AlertConfig(
        id=str(uuid.uuid4()),
        location_id=config_in.location_id,
        metric_type=m_upper,
        operator=op_upper,
        threshold_value=config_in.threshold_value,
        user_email=config_in.user_email,
        is_active=config_in.is_active,
        created_at=now_utc,
        updated_at=now_utc,
    )

    db.add(new_cfg)
    db.commit()
    db.refresh(new_cfg)

    return new_cfg


@router.get("/configs", response_model=List[AlertConfigResponse])
def list_alert_configs(
    location_id: Optional[str] = Query(None, description="Filter by location_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(AlertConfig)
    if location_id:
        q = q.filter(AlertConfig.location_id == location_id)

    configs = q.order_by(AlertConfig.created_at.desc()).offset(skip).limit(limit).all()
    return configs


@router.get("/notifications", response_model=List[AlertNotificationResponse])
def list_notifications(
    location_id: Optional[str] = Query(None, description="Filter by location_id"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(NotificationLog)
    if location_id:
        q = q.filter(NotificationLog.location_id == location_id)

    logs = (
        q.order_by(NotificationLog.dispatched_at.desc()).offset(skip).limit(limit).all()
    )
    return logs
