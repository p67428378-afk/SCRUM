
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
    # Dummy price calculation
    total_price = 100.0 
    db_booking = models.Rental(**booking.dict(), total_price=total_price, payment_status="pending", rental_status="pending")
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, rental_id: str):
    return db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()

def create_payment(db: Session, payment: schemas.PaymentCreate):
    # In a real app, you'd integrate with a payment gateway
    db_payment = models.Rental.query.filter_by(rental_id=payment.rental_id).first()
    if db_payment:
        db_payment.payment_status = "paid"
        db.commit()
        db.refresh(db_payment)
    return db_payment # This is not a real payment object, just for demonstration

def create_message(db: Session, message: schemas.MessageCreate, rental_id: str):
    db_message = models.Message(**message.dict(), rental_id=rental_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_for_rental(db: Session, rental_id: str):
    return db.query(models.Message).filter(models.Message.rental_id == rental_id).all()
