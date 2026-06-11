from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import renter as renter_schemas
from server.services import payments as payments_service
from server.services import bookings as bookings_service
from server.routers.auth import get_current_user
from pydantic import BaseModel, Field
import uuid

router = APIRouter()

class PaymentRequest(BaseModel):
    rental_id: uuid.UUID
    amount: float = Field(..., gt=0)
    payment_token: str = Field(..., min_length=10) # Placeholder for a payment gateway token

class PaymentResponse(BaseModel):
    payment_status: str
    transaction_id: str

@router.post("/", response_model=PaymentResponse)
def process_payment_endpoint(payment_request: PaymentRequest, db: Session = Depends(get_db), current_user: renter_schemas.RenterInDB = Depends(get_current_user)):
    rental = bookings_service.get_rental_by_id(db, str(payment_request.rental_id))
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    # Ensure the current user is the renter of this booking
    if rental.renter_id != current_user.renter_id:
        raise HTTPException(status_code=403, detail="Not authorized to make payment for this rental")

    if rental.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Payment already processed for this rental")

    # Process payment via service
    payment_result = payments_service.process_payment(db, str(payment_request.rental_id), payment_request.amount, payment_request.payment_token)

    if not payment_result or payment_result["payment_status"] != "paid": # Assuming service returns 'paid' on success
        raise HTTPException(status_code=400, detail="Payment failed")
    
    return PaymentResponse(payment_status="success", transaction_id=payment_result["transaction_id"])
