from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server import models, schemas


def get_customer_loyalty_balance(db: Session, customer_id: str) -> int:
    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )
    return customer.loyalty_points


def redeem_loyalty_points(
    db: Session, customer_id: str, points: int, description: Optional[str] = None
) -> models.LoyaltyTransaction:
    if points <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Points to redeem must be greater than 0",
        )

    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    if customer.loyalty_points < points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient loyalty points. Balance: {customer.loyalty_points}, Requested: {points}",
        )

    customer.loyalty_points -= points
    tx = models.LoyaltyTransaction(
        customer_id=customer.id,
        points_change=-points,
        transaction_type="redemption",
        description=description or f"Redeemed {points} loyalty points",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def get_customer_history(
    db: Session, customer_id: str
) -> schemas.CustomerHistoryResponse:
    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    appointments = (
        db.query(models.Appointment)
        .filter_by(customer_id=customer_id)
        .order_by(models.Appointment.start_time.desc())
        .all()
    )

    total_visits = sum(1 for appt in appointments if appt.status == "completed")

    loyalty_txs = (
        db.query(models.LoyaltyTransaction)
        .filter_by(customer_id=customer_id)
        .order_by(models.LoyaltyTransaction.created_at.desc())
        .all()
    )

    return schemas.CustomerHistoryResponse(
        customer=schemas.CustomerResponse.model_validate(customer),
        total_visits=total_visits,
        appointments=[
            schemas.AppointmentResponse.model_validate(a) for a in appointments
        ],
        loyalty_transactions=[
            schemas.LoyaltyTransactionResponse.model_validate(tx) for tx in loyalty_txs
        ],
    )
