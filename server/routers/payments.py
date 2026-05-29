
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.PaymentResponse)
def process_payment_for_booking(payment: schemas.Payment, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, rental_id=payment.rental_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # In a real app, you would have more complex logic here
    if booking.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Booking already paid")

    crud.process_payment(db=db, payment=payment)
    return {"transaction_id": "fake-transaction-id", "payment_status": "paid"}
