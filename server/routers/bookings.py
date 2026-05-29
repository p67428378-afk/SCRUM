from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud, schemas
from server.database import get_db
import uuid

router = APIRouter()

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    return crud.create_booking(db=db, booking=booking)

@router.get("/{rental_id}", response_model=schemas.BookingConfirmation)
def get_booking_confirmation(rental_id: uuid.UUID, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, rental_id=rental_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking