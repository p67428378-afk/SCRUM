import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from server.models.renter import Renter

@pytest.mark.anyio
async def test_register_user(client: AsyncClient, db_session: Session):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "renter_id" in data

    # Verify user is in DB
    renter = db_session.query(Renter).filter(Renter.email == "test@example.com").first()
    assert renter is not None
    assert renter.username == "testuser"

@pytest.mark.anyio
async def test_register_existing_user(client: AsyncClient, db_session: Session):
    # Register once
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "securepassword"
        }
    )
    # Try to register again with same email
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "anotheruser",
            "email": "test2@example.com",
            "password": "anotherpassword"
        }
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

@pytest.mark.anyio
async def test_login_for_access_token(client: AsyncClient, db_session: Session):
    # First, register a user
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "loginpassword"
        }
    )

    # Then, try to log in
    response = await client.post(
        "/api/v1/auth/token",
        data={
            "username": "login@example.com",
            "password": "loginpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.anyio
async def test_login_invalid_credentials(client: AsyncClient, db_session: Session):
    response = await client.post(
        "/api/v1/auth/token",
        data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect username or password"}

@pytest.mark.anyio
async def test_login_wrong_password(client: AsyncClient, db_session: Session):
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "userwithpassword",
            "email": "user@example.com",
            "password": "correctpassword"
        }
    )
    response = await client.post(
        "/api/v1/auth/token",
        data={
            "username": "user@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect username or password"}
