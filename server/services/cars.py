from typing import List, Optional
import uuid
from sqlalchemy.orm import Session

from server.models.car import Car
from server.models.location import Location
from server.schemas.car import CarCreate, CarUpdate

def get_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Car).offset(skip).limit(limit).all()

def get_car_by_id(db: Session, car_id: str):
    return db.query(Car).filter(Car.car_id == car_id).first()

def get_available_cars(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Car).filter(Car.status == "available").offset(skip).limit(limit).all()

def create_car(db: Session, car: CarCreate):
    db_car = Car(**car.model_dump())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

def update_car(db: Session, car_id: str, car: CarUpdate):
    db_car = db.query(Car).filter(Car.car_id == car_id).first()
    if db_car:
        for key, value in car.model_dump(exclude_unset=True).items():
            setattr(db_car, key, value)
        db.commit()
        db.refresh(db_car)
    return db_car

def delete_car(db: Session, car_id: str):
    db_car = db.query(Car).filter(Car.car_id == car_id).first()
    if db_car:
        db.delete(db_car)
        db.commit()
    return db_car
