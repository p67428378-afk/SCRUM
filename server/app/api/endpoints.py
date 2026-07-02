import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from pydantic import BaseModel

from server.app.database import get_db
from server.app.schemas import (
    AlertRegisterRequest,
    AlertRegisterResponse,
    OTPSendRequest,
    OTPSendResponse,
    OTPVerifyRequest,
    OTPVerifyResponse,
    AlertRuleResponse,
)
from server.app import crud

router = APIRouter()

# Simple regex for validation
CARD_RE = re.compile(r"^\d{16}$")
MOBILE_RE = re.compile(r"^\+?\d{10,15}$")


class SimulateSpendRequest(BaseModel):
    cardNumber: str
    amount: Decimal


@router.post("/alerts/register", response_model=AlertRegisterResponse)
def register_alert(payload: AlertRegisterRequest, db: Session = Depends(get_db)):
    if not CARD_RE.match(payload.cardNumber):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid card number format. Must be 16 digits.",
        )
    if not MOBILE_RE.match(payload.mobileNumber):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number format.",
        )

    # Simulate sending OTP
    otp_code = "123456"
    otp_tx = crud.create_otp_transaction(db, payload.mobileNumber, otp_code)

    return AlertRegisterResponse(
        otpReferenceId=otp_tx.otp_reference_id, status="PENDING_VERIFICATION"
    )


@router.post("/otp/send", response_model=OTPSendResponse)
def send_otp(payload: OTPSendRequest, db: Session = Depends(get_db)):
    if not MOBILE_RE.match(payload.mobileNumber):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number format.",
        )

    otp_code = "123456"
    otp_tx = crud.create_otp_transaction(db, payload.mobileNumber, otp_code)

    return OTPSendResponse(otpReferenceId=otp_tx.otp_reference_id, status="SENT")


@router.post("/otp/verify", response_model=OTPVerifyResponse)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp_tx = crud.get_otp_transaction(db, payload.otpReferenceId)
    if not otp_tx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP reference ID."
        )

    if otp_tx.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP already verified."
        )

    if datetime.utcnow() > otp_tx.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP has expired."
        )

    if otp_tx.otp_code != payload.otpCode:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP code."
        )

    # Mark OTP as verified
    otp_tx.is_verified = True
    db.commit()

    # Create or update alert rule
    rule = crud.create_or_update_alert_rule(
        db,
        payload.cardNumber,
        float(payload.dailySpendThreshold),
        payload.alertDeliveryChannel,
    )

    return OTPVerifyResponse(
        alertDeliveryChannel=rule.alert_delivery_channel,
        cardIdentifier=rule.card_identifier,
        dailySpendThreshold=Decimal(str(rule.daily_spend_threshold)),
        status=rule.status,
    )


@router.get("/alerts", response_model=List[AlertRuleResponse])
def list_alerts(db: Session = Depends(get_db)):
    rules = crud.get_active_alerts(db)
    return [
        AlertRuleResponse(
            alert_delivery_channel=r.alert_delivery_channel,
            card_identifier=r.card_identifier,
            current_daily_spend=Decimal(str(r.current_daily_spend)),
            daily_spend_threshold=Decimal(str(r.daily_spend_threshold)),
            status=r.status,
        )
        for r in rules
    ]


@router.post("/alerts/simulate-spend")
def simulate_spend(payload: SimulateSpendRequest, db: Session = Depends(get_db)):
    card_identifier = payload.cardNumber[-4:]
    rule = (
        db.query(crud.AlertRule)
        .filter(crud.AlertRule.card_identifier == card_identifier)
        .first()
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert rule not found for this card.",
        )

    rule.current_daily_spend = Decimal(str(rule.current_daily_spend)) + payload.amount
    db.commit()
    db.refresh(rule)

    sms_sent = False
    message = f"Spend updated to {rule.current_daily_spend}."
    if rule.current_daily_spend > rule.daily_spend_threshold:
        sms_sent = True
        message += " Immediate SMS alert sent: Daily spend threshold breached!"

    return {
        "status": "SUCCESS",
        "current_daily_spend": rule.current_daily_spend,
        "daily_spend_threshold": rule.daily_spend_threshold,
        "sms_sent": sms_sent,
        "message": message,
    }
