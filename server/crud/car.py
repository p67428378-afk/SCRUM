
from sqlalchemy.orm import Session
from server.models.car import Car
from uuid import UUID

def get_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Car).offset(skip).limit(limit).all()

def get_car(db: Session, car_id: UUID):
    return db.query(Car).filter(Car.car_id == car_id).first()
