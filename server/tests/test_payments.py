import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from server.models.renter import Renter
from server.models.car_owner import CarOwner
from server.models.location import Location
from server.models.car import Car
from server.models.rental import Rental
from server.services.auth import get_password_hash, create_access_token
from server.config import settings

@pytest.fixture
def test_renter_payment(db_session: Session):
    renter = Renter(
        username="paymentrenter",
        email="payment@example.com",
        password_hash=get_password_hash("paymentpassword")
    )
    db_session.add(renter)
    db_session.commit()
    db_session.refresh(renter)
    return renter

@pytest.fixture
def test_car_owner_payment(db_session: Session):
    owner = CarOwner(
        username="paymentowner",
        email="paymentowner@example.com",
        password_hash=get_password_hash("ownerpaymentpassword")
    )
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    return owner

@pytest.fixture
def test_location_payment(db_session: Session):
    location = Location(
        address="789 Payment Rd",
        city="Paytown",
        state="TX",
        zip_code="75001"
    )
    db_session.add(location)
    db_session.commit()
    db_session.refresh(location)
    return location

@pytest.fixture
def test_car_payment(db_session: Session, test_car_owner_payment: CarOwner, test_location_payment: Location):
    car = Car(
        owner_id=test_car_owner_payment.owner_id,
        make="Ford",
        model="Focus",
        year=2021,
        vin="11223344556677889",
        license_plate="PAY123",
        daily_rate=40.0,
        status="available",
        current_location_id=test_location_payment.location_id
    )
    db_session.add(car)
    db_session.commit()
    db_session.refresh(car)
    return car

@pytest.fixture
def test_rental_payment(db_session: Session, test_renter_payment: Renter, test_car_payment: Car, test_location_payment: Location):
    rental = Rental(
        car_id=test_car_payment.car_id,
        renter_id=test_renter_payment.renter_id,
        pickup_location_id=test_location_payment.location_id,
        start_date=datetime.utcnow() + timedelta(days=1),
        end_date=datetime.utcnow() + timedelta(days=3),
        total_price=80.0, # 2 days * 40.0 daily rate
        payment_status="pending",
        rental_status="booked"
    )
    db_session.add(rental)
    db_session.commit()
    db_session.refresh(rental)
    return rental

@pytest.fixture
def renter_access_token_payment(test_renter_payment: Renter):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": test_renter_payment.email}, expires_delta=access_token_expires
    )

@pytest.mark.anyio
async def test_process_payment(client: AsyncClient, db_session: Session, test_rental_payment: Rental, renter_access_token_payment: str):
    response = await client.post(
        "/api/v1/payments/",
        headers={
            "Authorization": f"Bearer {renter_access_token_payment}"
        },
        json={
            "rental_id": str(test_rental_payment.rental_id),
            "amount": 80.0,
            "payment_token": "mock_payment_token_123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["payment_status"] == "success"
    assert "transaction_id" in data

    # Verify rental payment status updated in DB
    db_session.refresh(test_rental_payment)
    assert test_rental_payment.payment_status == "paid"

@pytest.mark.anyio
async def test_process_payment_rental_not_found(client: AsyncClient, db_session: Session, renter_access_token_payment: str):
    response = await client.post(
        "/api/v1/payments/",
        headers={
            "Authorization": f"Bearer {renter_access_token_payment}"
        },
        json={
            "rental_id": str(uuid.uuid4()),
            "amount": 80.0,
            "payment_token": "mock_payment_token_123"
        }
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Rental not found"}

@pytest.mark.anyio
async def test_process_payment_already_paid(client: AsyncClient, db_session: Session, test_rental_payment: Rental, renter_access_token_payment: str):
    # Set rental to paid first
    test_rental_payment.payment_status = "paid"
    db_session.add(test_rental_payment)
    db_session.commit()
    db_session.refresh(test_rental_payment)

    response = await client.post(
        "/api/v1/payments/",
        headers={
            "Authorization": f"Bearer {renter_access_token_payment}"
        },
        json={
            "rental_id": str(test_rental_payment.rental_id),
            "amount": 80.0,
            "payment_token": "mock_payment_token_123"
        }
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Payment already processed for this rental"}
