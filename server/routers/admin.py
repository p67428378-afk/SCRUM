import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.banking import AuditLog
from server.models.config import ConfigItem
from server.models.user import User
from server.routers.banking import get_current_user
from server.schemas.banking import (
    AuditLogListResponse,
    AuditLogResponse,
    RiskSignalResponse,
    ConfigItemResponse,
    ConfigItemCreateRequest,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required",
        )
    return current_user


@router.get("/audit-logs", response_model=AuditLogListResponse)
def list_audit_logs(
    actor: str | None = Query(None),
    event_type: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    limit: int = Query(50),
    skip: int = Query(0),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)

    if actor:
        query = query.filter(AuditLog.actor.ilike(f"%{actor}%"))
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if start_date:
        try:
            dt_start = datetime.datetime.fromisoformat(start_date)
            query = query.filter(AuditLog.timestamp >= dt_start)
        except ValueError:
            pass
    if end_date:
        try:
            dt_end = datetime.datetime.fromisoformat(end_date)
            query = query.filter(AuditLog.timestamp <= dt_end)
        except ValueError:
            pass

    total = query.count()
    items = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

    response_items = []
    for item in items:
        response_items.append(
            AuditLogResponse(
                id=item.id,
                timestamp=item.timestamp,
                event_type=item.event_type,
                actor=item.actor,
                resource=item.resource,
                ip_address=item.ip_address,
                status=item.status,
                details=item.details or {},
            )
        )

    return AuditLogListResponse(items=response_items, total=total)


@router.get("/risk-signals", response_model=list[RiskSignalResponse])
def list_risk_signals(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # Generate some realistic mock risk signals for the compliance officer
    now = datetime.datetime.now(datetime.timezone.utc)
    signals = [
        RiskSignalResponse(
            id=uuid.uuid4(),
            timestamp=now - datetime.timedelta(minutes=5),
            signal_type="VELOCITY_ANOMALY",
            risk_score=85.5,
            details={
                "description": "Multiple high-value transfers initiated within 1 minute",
                "user_id": "test-user-id",
                "velocity": "3 txns/min",
            },
        ),
        RiskSignalResponse(
            id=uuid.uuid4(),
            timestamp=now - datetime.timedelta(hours=2),
            signal_type="DEVICE_FINGERPRINT_CHANGE",
            risk_score=45.0,
            details={
                "description": "Login from a new device fingerprint",
                "old_device": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                "new_device": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)",
            },
        ),
        RiskSignalResponse(
            id=uuid.uuid4(),
            timestamp=now - datetime.timedelta(days=1),
            signal_type="GEOLOCATION_ANOMALY",
            risk_score=92.0,
            details={
                "description": "Impossible travel detected between login sessions",
                "locations": ["New York, USA", "London, UK"],
                "time_difference": "45 minutes",
            },
        ),
    ]
    return signals


# Admin Config Endpoints
@router.get("/config", response_model=list[ConfigItemResponse])
def list_config_items(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    items = db.query(ConfigItem).all()
    return items


@router.post("/config", response_model=ConfigItemResponse)
def create_or_update_config_item(
    payload: ConfigItemCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    item = db.query(ConfigItem).filter(ConfigItem.key == payload.key).first()
    if not item:
        item = ConfigItem(key=payload.key)
        db.add(item)

    item.value = payload.value
    if payload.description is not None:
        item.description = payload.description
    item.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/config/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_config_item(
    key: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    item = db.query(ConfigItem).filter(ConfigItem.key == key).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Config item not found",
        )
    db.delete(item)
    db.commit()
