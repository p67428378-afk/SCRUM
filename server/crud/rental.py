
from sqlalchemy.orm import Session
from server.models.rental import Rental
from server.schemas.rental import BookingCreate

def create_booking(db: Session, booking: BookingCreate):
    # Dummy price calculation
    total_price = 100.0
    db_rental = Rental(
        car_id=booking.car_id,
        renter_id=booking.renter_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        pickup_location_id=booking.pickup_location_id,
        total_price=total_price,
        payment_status="Pending",
        rental_status="Pending"
    )
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

def get_booking_details(db: Session, rental_id: str):
    return db.query(Rental).filter(Rental.rental_id == rental_id).first()
