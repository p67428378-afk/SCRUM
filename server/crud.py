from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(models.Renter).filter(models.Renter.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.Renter(email=user.email, username=user.username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Car).offset(skip).limit(limit).all()

def get_car(db: Session, car_id: str):
    return db.query(models.Car).filter(models.Car.car_id == car_id).first()

def create_booking(db: Session, booking: schemas.BookingCreate):
    db_booking = models.Rental(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, rental_id: str):
    return db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()

def create_payment(db: Session, payment: schemas.PaymentCreate):
    # In a real application, you would process the payment with a payment gateway
    # and then update the payment status.
    db_payment = models.Rental.query.filter(models.Rental.rental_id == payment.rental_id).first()
    db_payment.payment_status = "paid"
    db.commit()
    db.refresh(db_payment)
    return {"transaction_id": "dummy_transaction_id", "payment_status": "paid"}
