import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
import uuid # Added import

from server.models.car_owner import CarOwner
from server.models.location import Location
from server.models.car import Car
from server.models.renter import Renter
from server.services.auth import get_password_hash, create_access_token
from server.config import settings
from datetime import timedelta

@pytest.fixture
def test_car_owner(db_session: Session):
    owner = CarOwner(
        username="carowner1",
        email="owner1@example.com",
        password_hash=get_password_hash("ownerpassword")
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    return owner

@pytest.fixture
def test_location(db_session: Session):
    location = Location(
        address="123 Main St",
        city="Anytown",
        state="CA",
        zip_code="90210"
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location

@pytest.fixture
def test_car(db_session: Session, test_car_owner: CarOwner, test_location: Location):
    car = Car(
        owner_id=test_car_owner.owner_id,
        make="Toyota",
        model="Camry",
        year=2023,
        vin="12345678901234567",
        license_plate="ABC1234",
        daily_rate=75.0,
        status="available",
        image_urls="http://example.com/car1.jpg,http://example.com/car2.jpg",
        description="A comfortable sedan",
        current_location_id=test_location.location_id
    )
    db_session.add(car)
    db_session.commit()
    db_session.refresh(car)
    return car

@pytest.fixture
def test_renter(db_session: Session):
    renter = Renter(
        username="testrenter",
        email="renter@example.com",
        password_hash=get_password_hash("renterpassword")
    )
    db_session.add(renter)
    db_session.commit()
    db_session.refresh(renter)
    return renter

@pytest.fixture
def renter_access_token(test_renter: Renter):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": test_renter.email}, expires_delta=access_token_expires
    )

@pytest.mark.anyio
async def test_get_car_availability(client: AsyncClient, db_session: Session, test_car: Car, renter_access_token: str):
    response = await client.get(
        "/api/v1/cars/availability",
        headers={
            "Authorization": f"Bearer {renter_access_token}"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["car_id"] == test_car.car_id
    assert data[0]["status"] == "available"
    assert "http://example.com/car1.jpg" in data[0]["image_urls"]

@pytest.mark.anyio
async def test_get_car_details(client: AsyncClient, db_session: Session, test_car: Car, renter_access_token: str):
    response = await client.get(
        f"/api/v1/cars/{test_car.car_id}/details",
        headers={
            "Authorization": f"Bearer {renter_access_token}"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["car_id"] == test_car.car_id
    assert data["make"] == "Toyota"
    assert data["model"] == "Camry"
    assert data["status"] == "available"
    assert "http://example.com/car1.jpg" in data["image_urls"]

@pytest.mark.anyio
async def test_get_car_details_not_found(client: AsyncClient, db_session: Session, renter_access_token: str):
    response = await client.get(
        f"/api/v1/cars/{uuid.uuid4()}/details",
        headers={
            "Authorization": f"Bearer {renter_access_token}"
        }
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Car not found"}
