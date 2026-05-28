
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter()

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(database.get_db)):
    return crud.create_booking(db=db, booking=booking)

@router.get("/{rental_id}", response_model=schemas.Booking)
def get_booking_details(rental_id: str, db: Session = Depends(database.get_db)):
    booking = crud.get_booking(db, rental_id=rental_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
