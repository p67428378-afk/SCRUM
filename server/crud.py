from sqlalchemy.orm import Session
from server import models, schemas
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(models.Renter).filter(models.Renter.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.Renter(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Car).offset(skip).limit(limit).all()

def get_car(db: Session, car_id: uuid.UUID):
    return db.query(models.Car).filter(models.Car.car_id == car_id).first()

def create_booking(db: Session, booking: schemas.BookingCreate):
    # Simplified total_price calculation
    total_price = 100.0
    db_booking = models.Rental(**booking.dict(), total_price=total_price, payment_status="pending", rental_status="pending")
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, rental_id: uuid.UUID):
    return db.query(models.Rental).filter(models.Rental.rental_id == rental_id).first()

def create_payment(db: Session, payment: schemas.PaymentCreate):
    # Mock payment processing
    transaction_id = str(uuid.uuid4())
    booking = get_booking(db, payment.rental_id)
    if booking:
        booking.payment_status = "completed"
        db.commit()
        db.refresh(booking)
    return {"transaction_id": transaction_id, "payment_status": "completed"}