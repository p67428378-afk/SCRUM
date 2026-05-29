
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    car = crud.get_car(db, car_id=booking.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Calculate total price (dummy calculation)
    duration = (booking.end_date - booking.start_date).days
    total_price = duration * car.daily_rate

    db_booking = crud.create_booking(db=db, booking=booking, total_price=total_price)
    return db_booking

@router.get("/{rental_id}", response_model=schemas.BookingDetails)
def get_booking_details(rental_id: uuid.UUID, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, rental_id=rental_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
