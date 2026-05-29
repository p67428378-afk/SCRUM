
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    return crud.create_booking(db=db, booking=booking)

@router.get("/{rental_id}", response_model=schemas.BookingDetails)
def get_booking_details(rental_id: uuid.UUID, db: Session = Depends(get_db)):
    booking = crud.get_booking_details(db, rental_id=rental_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
