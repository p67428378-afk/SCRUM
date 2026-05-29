
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.car import Car, CarDetails
from server.crud import car as crud_car
from typing import List
from uuid import UUID

router = APIRouter()

@router.get("/availability", response_model=List[Car])
def get_cars_availability(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    cars = crud_car.get_cars(db, skip=skip, limit=limit)
    return cars

@router.get("/{car_id}/details", response_model=CarDetails)
def get_car_details(car_id: UUID, db: Session = Depends(get_db)):
    car = crud_car.get_car(db, car_id=car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car
