from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Rental)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    return crud.create_booking(db=db, booking=booking)

@router.get("/{rental_id}", response_model=schemas.Rental)
def get_booking_confirmation(rental_id: str, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, rental_id=rental_id)
    return booking
