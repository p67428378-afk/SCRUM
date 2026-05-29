
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.get("/availability", response_model=List[schemas.CarAvailability])
def get_available_cars(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    cars = crud.get_cars(db, skip=skip, limit=limit)
    return cars

@router.get("/{car_id}/details", response_model=schemas.CarDetails)
def get_car_details(car_id: uuid.UUID, db: Session = Depends(get_db)):
    car = crud.get_car(db, car_id=car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car
