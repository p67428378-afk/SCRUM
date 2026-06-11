from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy.orm import Session

from server.models.rental import Rental
from server.schemas.rental import RentalCreate

def get_rental_by_id(db: Session, rental_id: str):
    return db.query(Rental).filter(Rental.rental_id == rental_id).first()

def create_rental(db: Session, rental: RentalCreate):
    # Calculate total price based on daily rate and dates (simplified for now)
    # In a real app, this would involve fetching car daily rate and calculating duration
    # For now, we'll use a placeholder or assume total_price is handled elsewhere before calling this.
    # The schema for RentalCreate doesn't include total_price, so we'll need to add it or calculate it here.
    # Let's assume total_price will be calculated in the router or a more complex service function.
    # For this service function, we'll just create the rental with default payment_status and rental_status.

    # For now, let's assume total_price is passed in the RentalCreate schema or calculated before this call.
    # If not, we need to adjust the schema or add car fetching logic here.
    # Given the API contract for POST /api/v1/bookings, total_price is part of the response, not request_body.
    # So, we need to calculate it here or get it from the car service.

    # Let's modify RentalCreate to include total_price for simplicity in this service layer.
    # Or, better, fetch car details here to calculate.
    # For now, I'll make a placeholder calculation.

    # Placeholder for total_price and statuses
    # In a real scenario, car_id would be used to fetch daily_rate
    # and dates would be used to calculate duration.
    # For now, we'll set default values for payment_status and rental_status.
    db_rental = Rental(
        car_id=str(rental.car_id),
        renter_id=str(rental.renter_id),
        pickup_location_id=str(rental.pickup_location_id),
        start_date=rental.start_date,
        end_date=rental.end_date,
        total_price=100.0, # Placeholder
        payment_status="pending", # Placeholder
        rental_status="booked" # Placeholder
    )
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

def update_rental_status(db: Session, rental_id: str, new_status: str):
    db_rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()
    if db_rental:
        db_rental.rental_status = new_status
        db.commit()
        db.refresh(db_rental)
    return db_rental

def update_payment_status(db: Session, rental_id: str, new_status: str):
    db_rental = db.query(Rental).filter(Rental.rental_id == rental_id).first()
    if db_rental:
        db_rental.payment_status = new_status
        db.commit()
        db.refresh(db_rental)
    return db_rental
