
from sqlalchemy.orm import Session
from server.models.car import Car

def get_available_cars(db: Session):
    return db.query(Car).filter(Car.status == 'Available').all()

def get_car_details(db: Session, car_id: str):
    return db.query(Car).filter(Car.car_id == car_id).first()
