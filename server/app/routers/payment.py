"""
Module: routers.payment
Purpose: API router for Bills and Payments
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.payment import Bill, Payment
from server.app.schemas.payment import BillResponse, PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/v1", tags=["payments"])


@router.get("/bills", response_model=List[BillResponse])
def get_bills(resident_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get outstanding dues.
    """
    query = db.query(Bill)
    if resident_id:
        query = query.filter(Bill.resident_id == resident_id)
    return query.all()


@router.post(
    "/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED
)
def make_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    """
    Make a payment for a bill.
    """
    bill = db.query(Bill).filter(Bill.id == payload.bill_id).first()
    if not bill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid bill"
        )

    if bill.status == "Paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Bill is already paid"
        )

    # Simple validation of card details if payment method is card
    if payload.payment_method.lower() == "card":
        if (
            not payload.card_details
            or not payload.card_details.card_number
            or not payload.card_details.cvv
            or not payload.card_details.expiry
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment failed: Missing card details",
            )

    try:
        # Create payment record
        transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        new_payment = Payment(
            bill_id=payload.bill_id,
            amount_paid=payload.amount_paid,
            payment_method=payload.payment_method,
            transaction_id=transaction_id,
        )
        db.add(new_payment)

        # Update bill status
        bill.status = "Paid"
        db.commit()
        db.refresh(new_payment)

        # Return response with status
        response_data = {
            "id": new_payment.id,
            "bill_id": new_payment.bill_id,
            "amount_paid": new_payment.amount_paid,
            "transaction_id": new_payment.transaction_id,
            "payment_date": new_payment.payment_date,
            "status": "Success",
        }
        return response_data
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Payment failed: {str(e)}"
        )
