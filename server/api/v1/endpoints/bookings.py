
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import SessionLocal
from server.schemas.rental import BookingCreate, BookingResponse, BookingDetails
from server.crud import rental as crud_rental

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return crud_rental.create_booking(db=db, booking=booking)

@router.get("/{rental_id}", response_model=BookingDetails)
def get_booking(rental_id: str, db: Session = Depends(get_db)):
    booking = crud_rental.get_booking_details(db, rental_id=rental_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
