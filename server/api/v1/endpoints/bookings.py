
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.rental import RentalCreate, Rental, RentalConfirmation
from server.crud import rental as crud_rental
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=Rental)
def create_booking(rental: RentalCreate, db: Session = Depends(get_db)):
    return crud_rental.create_rental(db=db, rental=rental)

@router.get("/{rental_id}", response_model=RentalConfirmation)
def get_booking_confirmation(rental_id: UUID, db: Session = Depends(get_db)):
    rental = crud_rental.get_rental(db, rental_id=rental_id)
    if rental is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return rental
