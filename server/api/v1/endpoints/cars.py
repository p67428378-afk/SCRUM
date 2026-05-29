
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from server.database import SessionLocal
from server.schemas.car import CarAvailability, CarDetails
from server.crud import car as crud_car

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/availability", response_model=List[CarAvailability])
def get_availability(db: Session = Depends(get_db)):
    cars = crud_car.get_available_cars(db)
    return cars

@router.get("/{car_id}/details", response_model=CarDetails)
def get_details(car_id: str, db: Session = Depends(get_db)):
    car = crud_car.get_car_details(db, car_id=car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car
