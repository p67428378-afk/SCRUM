import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from server.app.models import AlertRule, OTPTransaction


def create_otp_transaction(
    db: Session, mobile_number: str, otp_code: str
) -> OTPTransaction:
    otp_ref = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    db_otp = OTPTransaction(
        otp_reference_id=otp_ref,
        mobile_number=mobile_number,
        otp_code=otp_code,
        expires_at=expires_at,
    )
    db.add(db_otp)
    db.commit()
    db.refresh(db_otp)
    return db_otp


def get_otp_transaction(db: Session, otp_reference_id: str) -> OTPTransaction:
    return (
        db.query(OTPTransaction)
        .filter(OTPTransaction.otp_reference_id == otp_reference_id)
        .first()
    )


def create_or_update_alert_rule(
    db: Session,
    card_number: str,
    daily_spend_threshold: float,
    alert_delivery_channel: str,
) -> AlertRule:
    card_identifier = card_number[-4:]
    db_rule = (
        db.query(AlertRule).filter(AlertRule.card_identifier == card_identifier).first()
    )
    if db_rule:
        db_rule.daily_spend_threshold = daily_spend_threshold
        db_rule.alert_delivery_channel = alert_delivery_channel
        db_rule.status = "ACTIVE"
        db_rule.updated_at = datetime.utcnow()
    else:
        db_rule = AlertRule(
            card_identifier=card_identifier,
            daily_spend_threshold=daily_spend_threshold,
            alert_delivery_channel=alert_delivery_channel,
            status="ACTIVE",
        )
        db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


def get_active_alerts(db: Session):
    return db.query(AlertRule).filter(AlertRule.status == "ACTIVE").all()
