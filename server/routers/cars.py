from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.schemas import car as car_schemas
from server.schemas import renter as renter_schemas
from server.services import cars as cars_service
from server.routers.auth import get_current_user

router = APIRouter()

@router.get("/availability", response_model=List[car_schemas.CarAvailability])
def get_car_availability(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: renter_schemas.RenterInDB = Depends(get_current_user)):
    cars = cars_service.get_available_cars(db, skip=skip, limit=limit)
    return [
        car_schemas.CarAvailability(
            car_id=car.car_id,
            make=car.make,
            model=car.model,
            year=car.year,
            daily_rate=car.daily_rate,
            status=car.status,
            image_urls=car.get_image_urls_list()
        )
        for car in cars
    ]

@router.get("/{car_id}/details", response_model=car_schemas.CarInDB)
def get_car_details(car_id: str, db: Session = Depends(get_db), current_user: renter_schemas.RenterInDB = Depends(get_current_user)):
    car = cars_service.get_car_by_id(db, car_id=car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return car_schemas.CarInDB(
        car_id=car.car_id,
        owner_id=car.owner_id,
        make=car.make,
        model=car.model,
        year=car.year,
        vin=car.vin,
        license_plate=car.license_plate,
        daily_rate=car.daily_rate,
        status=car.status,
        image_urls=car.get_image_urls_list(),
        description=car.description,
        current_location_id=car.current_location_id,
        created_at=car.created_at,
        updated_at=car.updated_at
    )
