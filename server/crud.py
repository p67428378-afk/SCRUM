
from sqlalchemy.orm import Session
from server import models, schemas
import uuid

# Renter CRUD
def get_renter_by_email(db: Session, email: str):
    return db.query(models.Renters).filter(models.Renters.email == email).first()

def create_renter(db: Session, user: schemas.UserCreate):
    hashed_password = user.password + "notreallyhashed"
    db_user = models.Renters(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Car CRUD
def get_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cars).offset(skip).limit(limit).all()

def get_car(db: Session, car_id: uuid.UUID):
    return db.query(models.Cars).filter(models.Cars.car_id == car_id).first()

# Booking CRUD
def create_booking(db: Session, booking: schemas.BookingCreate, total_price: float):
    db_booking = models.Rentals(**booking.dict(), total_price=total_price, payment_status="pending", rental_status="pending_payment")
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, rental_id: uuid.UUID):
    return db.query(models.Rentals).filter(models.Rentals.rental_id == rental_id).first()

# Payment CRUD
def process_payment(db: Session, payment: schemas.Payment):
    # In a real application, you would integrate with a payment gateway like Stripe.
    # For this example, we'll just update the payment status.
    db_booking = get_booking(db, rental_id=payment.rental_id)
    if db_booking:
        db_booking.payment_status = "paid"
        db.commit()
        db.refresh(db_booking)
    return db_booking

# Message CRUD
def create_message(db: Session, message: schemas.Message):
    db_message = models.Messages(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
