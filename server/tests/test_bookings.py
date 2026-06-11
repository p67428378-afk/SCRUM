import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from server.models.renter import Renter
from server.models.car_owner import CarOwner
from server.models.location import Location
from server.models.car import Car
from server.services.auth import get_password_hash, create_access_token
from server.config import settings

@pytest.fixture
def test_renter_booking(db_session: Session):
    renter = Renter(
        username="bookingrenter",
        email="booking@example.com",
        password_hash=get_password_hash("bookingpassword")
    )
    db_session.add(renter)
    db_session.commit()
    db_session.refresh(renter)
    return renter

@pytest.fixture
def test_car_owner_booking(db_session: Session):
    owner = CarOwner(
        username="bookingowner",
        email="bookingowner@example.com",
        password_hash=get_password_hash("ownerbookingpassword")
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    return owner

@pytest.fixture
def test_location_booking(db_session: Session):
    location = Location(
        address="456 Rental Ave",
        city="Othertown",
        state="NY",
        zip_code="10001"
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location

@pytest.fixture
def test_car_booking(db_session: Session, test_car_owner_booking: CarOwner, test_location_booking: Location):
    car = Car(
        owner_id=test_car_owner_booking.owner_id,
        make="Honda",
        model="Civic",
        year=2022,
        vin="98765432109876543",
        license_plate="XYZ789",
        daily_rate=50.0,
        status="available",
        current_location_id=test_location_booking.location_id
    )
    db_session.add(car)
    db_session.commit()
    db_session.refresh(car)
    return car

@pytest.fixture
def renter_access_token_booking(test_renter_booking: Renter):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": test_renter_booking.email}, expires_delta=access_token_expires
    )

@pytest.mark.anyio
async def test_create_booking(client: AsyncClient, db_session: Session, test_renter_booking: Renter, test_car_booking: Car, test_location_booking: Location, renter_access_token_booking: str):
    start_date = datetime.utcnow() + timedelta(days=1)
    end_date = datetime.utcnow() + timedelta(days=3)

    response = await client.post(
        "/api/v1/bookings/",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        },
        json={
            "car_id": str(test_car_booking.car_id),
            "renter_id": str(test_renter_booking.renter_id),
            "pickup_location_id": str(test_location_booking.location_id),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["car_id"] == str(test_car_booking.car_id)
    assert data["renter_id"] == str(test_renter_booking.renter_id)
    assert data["payment_status"] == "pending"
    assert data["rental_status"] == "booked"
    assert data["total_price"] == 100.0 # Placeholder from service

    # Verify car status updated
    car_response = await client.get(
        f"/api/v1/cars/{test_car_booking.car_id}/details",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        }
    )
    assert car_response.status_code == 200
    car_data = car_response.json()
    assert car_data["status"] == "rented"

@pytest.mark.anyio
async def test_create_booking_car_not_available(client: AsyncClient, db_session: Session, test_renter_booking: Renter, test_car_booking: Car, test_location_booking: Location, renter_access_token_booking: str):
    # Set car status to maintenance
    test_car_booking.status = "maintenance"
    db_session.add(test_car_booking)
    db_session.commit()
    db_session.refresh(test_car_booking)

    start_date = datetime.utcnow() + timedelta(days=1)
    end_date = datetime.utcnow() + timedelta(days=3)

    response = await client.post(
        "/api/v1/bookings/",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        },
        json={
            "car_id": str(test_car_booking.car_id),
            "renter_id": str(test_renter_booking.renter_id),
            "pickup_location_id": str(test_location_booking.location_id),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Car not available for booking"}

@pytest.mark.anyio
async def test_get_booking_confirmation(client: AsyncClient, db_session: Session, test_renter_booking: Renter, test_car_booking: Car, test_location_booking: Location, renter_access_token_booking: str):
    start_date = datetime.utcnow() + timedelta(days=5)
    end_date = datetime.utcnow() + timedelta(days=7)

    # First, create a booking
    create_response = await client.post(
        "/api/v1/bookings/",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        },
        json={
            "car_id": str(test_car_booking.car_id),
            "renter_id": str(test_renter_booking.renter_id),
            "pickup_location_id": str(test_location_booking.location_id),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    )
    assert create_response.status_code == 201
    booking_data = create_response.json()
    rental_id = booking_data["rental_id"]

    # Then, get booking confirmation
    get_response = await client.get(
        f"/api/v1/bookings/{rental_id}",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        }
    )
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["rental_id"] == rental_id
    assert data["renter_id"] == str(test_renter_booking.renter_id)

@pytest.mark.anyio
async def test_get_booking_confirmation_not_found(client: AsyncClient, db_session: Session, renter_access_token_booking: str):
    response = await client.get(
        f"/api/v1/bookings/{uuid.uuid4()}",
        headers={
            "Authorization": f"Bearer {renter_access_token_booking}"
        }
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Booking not found"}
