import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.banking import Alert, AlertPreference
from server.models.user import User
from server.routers.banking import get_current_user
from server.schemas.banking import (
    AlertPreferencesResponse,
    AlertPreferencesUpdateRequest,
    AlertResponse,
)
from server.utils.audit import log_event

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )
    return alerts


@router.get("/preferences", response_model=AlertPreferencesResponse)
def get_alert_preferences(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    prefs = (
        db.query(AlertPreference)
        .filter(AlertPreference.user_id == current_user.id)
        .first()
    )
    if not prefs:
        prefs = AlertPreference(
            id=uuid.uuid4(),
            user_id=current_user.id,
            push_enabled=True,
            sms_enabled=True,
            email_enabled=True,
            low_balance_threshold=100.00,
            large_transaction_threshold=1000.00,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs


@router.post("/preferences", response_model=AlertPreferencesResponse)
def update_alert_preferences_post(
    payload: AlertPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_alert_preferences(payload, current_user, db)


@router.put("/preferences", response_model=AlertPreferencesResponse)
def update_alert_preferences_put(
    payload: AlertPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_alert_preferences(payload, current_user, db)


def update_alert_preferences(
    payload: AlertPreferencesUpdateRequest,
    current_user: User,
    db: Session,
):
    prefs = (
        db.query(AlertPreference)
        .filter(AlertPreference.user_id == current_user.id)
        .first()
    )
    if not prefs:
        prefs = AlertPreference(
            id=uuid.uuid4(),
            user_id=current_user.id,
        )
        db.add(prefs)

    prefs.push_enabled = payload.push_enabled
    prefs.sms_enabled = payload.sms_enabled
    prefs.email_enabled = payload.email_enabled
    prefs.low_balance_threshold = payload.low_balance_threshold
    prefs.large_transaction_threshold = payload.large_transaction_threshold
    db.commit()
    db.refresh(prefs)

    log_event(
        event_type="UPDATE_ALERT_PREFERENCES",
        user_id=str(current_user.id),
        username=current_user.username,
        severity="INFO",
    )

    return prefs
