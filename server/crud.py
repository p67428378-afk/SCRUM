
from sqlalchemy.orm import Session
from . import models, schemas
import uuid

def get_user_by_email(db: Session, email: str):
    return db.query(models.Renter).filter(models.Renter.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    # In a real app, you'd hash the password
    password_hash = user.password + "_hashed"
    db_user = models.Renter(username=user.username, email=user.email, password_hash=password_hash)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_available_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Car).filter(models.Car.status == 'Available').offset(skip).limit(limit).all()

def get_car_details(db: Session, car_id: uuid.UUID):
    return db.query(models.Car).filter(models.Car.car_id == car_id).first()

def create_booking(db: Session, booking: schemas.BookingCreate):
    # Dummy price calculation
    total_price = 100.0 
    db_booking = models.Rental(
        car_id=booking.car_id,
        renter_id=booking.renter_id,
        pickup_location_id=booking.pickup_location_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=total_price,
        payment_status="Pending",
        rental_status="Pending"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def process_payment(db: Session, payment: schemas.Payment):
    # In a real app, you'd integrate with a payment gateway
    db.query(models.Rental).filter(models.Rental.rental_id == payment.rental_id).update({"payment_status": "Paid"})
    db.commit()
    return {"transaction_id": str(uuid.uuid4()), "payment_status": "Paid"}

def get_booking_details(db: Session, rental_id: uuid.UUID):
    return db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()
