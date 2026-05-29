from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..database import get_db

router = APIRouter()

@router.get("/availability", response_model=List[schemas.Car])
def get_car_availability(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    cars = crud.get_cars(db, skip=skip, limit=limit)
    return cars

@router.get("/{car_id}/details", response_model=schemas.Car)
def get_car_details(car_id: str, db: Session = Depends(get_db)):
    car = crud.get_car(db, car_id=car_id)
    return car
