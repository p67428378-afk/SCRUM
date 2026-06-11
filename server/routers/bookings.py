from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import rental as rental_schemas
from server.schemas import renter as renter_schemas
from server.schemas import car as car_schemas # Added import
from server.services import bookings as bookings_service
from server.services import cars as cars_service
from server.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=rental_schemas.RentalInDB, status_code=status.HTTP_201_CREATED)
def create_booking(rental: rental_schemas.RentalCreate, db: Session = Depends(get_db), current_user: renter_schemas.RenterInDB = Depends(get_current_user)):
    # Ensure the renter_id in the request matches the current authenticated user's ID
    if str(rental.renter_id) != current_user.renter_id:
        raise HTTPException(status_code=403, detail="Not authorized to create booking for this renter ID")

    # Check car availability and daily rate
    car = cars_service.get_car_by_id(db, str(rental.car_id))
    if not car or car.status != "available":
        raise HTTPException(status_code=400, detail="Car not available for booking")

    # Calculate total price
    duration = (rental.end_date - rental.start_date).days
    if duration <= 0:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    total_price = car.daily_rate * duration

    # Create the rental with calculated total price and initial statuses
    db_rental = bookings_service.create_rental(db, rental)
    db_rental.total_price = total_price
    db_rental.payment_status = "pending"
    db_rental.rental_status = "booked"
    db.commit()
    db.refresh(db_rental)

    # Update car status to rented
    cars_service.update_car(db, str(rental.car_id), car_schemas.CarUpdate(status="rented"))

    return db_rental

@router.get("/{rental_id}", response_model=rental_schemas.RentalInDB)
def get_booking_confirmation(rental_id: str, db: Session = Depends(get_db), current_user: renter_schemas.RenterInDB = Depends(get_current_user)):
    rental = bookings_service.get_rental_by_id(db, rental_id=rental_id)
    if rental is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Ensure the current user is the renter of this booking
    if rental.renter_id != current_user.renter_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")

    return rental
