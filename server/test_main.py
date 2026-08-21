import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from server.main import app
from server.database import Base, get_db

# Setup SQLite in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


# Dependency override
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    # Clear tables and recreate for clean test state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(db_session):
    with TestClient(app) as c:
        yield c


def test_get_recipes_empty(client):
    # Since db_session drops and recreates tables, it should be empty
    response = client.get("/api/v1/recipes")
    assert response.status_code == 200
    assert response.json() == []


def test_create_recipe_success(client):
    payload = {
        "title": "Classic Pancakes",
        "description": "Fluffy and delicious homemade pancakes.",
        "prep_time": 10,
        "cook_time": 15,
        "servings": 4,
        "instructions": "1. Whisk dry ingredients.\n2. Whisk wet ingredients.\n3. Combine and cook.",
        "ingredients": [
            {"name": "Flour", "quantity": "2", "unit": "cups"},
            {"name": "Eggs", "quantity": "2", "unit": "large"},
        ],
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Classic Pancakes"
    assert len(data["ingredients"]) == 2
    assert data["ingredients"][0]["name"] == "Flour"


def test_create_recipe_validation_error(client):
    # Missing title
    payload = {
        "description": "Fluffy and delicious homemade pancakes.",
        "prep_time": 10,
        "cook_time": 15,
        "servings": 4,
        "instructions": "1. Whisk dry ingredients.",
        "ingredients": [],
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 422

    # Missing description
    payload = {
        "title": "Classic Pancakes",
        "prep_time": 10,
        "cook_time": 15,
        "servings": 4,
        "instructions": "1. Whisk dry ingredients.",
        "ingredients": [],
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 422

    # Negative prep_time
    payload = {
        "title": "Classic Pancakes",
        "description": "Fluffy and delicious homemade pancakes.",
        "prep_time": -5,
        "cook_time": 15,
        "servings": 4,
        "instructions": "1. Whisk dry ingredients.",
        "ingredients": [{"name": "Flour", "quantity": "2", "unit": "cups"}],
    }
    response = client.post("/api/v1/recipes", json=payload)
    assert response.status_code == 422
    assert "Please enter a valid positive number." in response.text


def test_get_recipe_by_id(client):
    # Create a recipe first
    payload = {
        "title": "Tacos",
        "description": "Delicious Mexican tacos.",
        "prep_time": 15,
        "cook_time": 10,
        "servings": 2,
        "instructions": "Assemble tacos.",
        "ingredients": [{"name": "Tortilla", "quantity": "4", "unit": "pieces"}],
    }
    create_resp = client.post("/api/v1/recipes", json=payload)
    recipe_id = create_resp.json()["id"]

    # Get by ID
    response = client.get(f"/api/v1/recipes/{recipe_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Tacos"


def test_get_recipe_not_found(client):
    response = client.get("/api/v1/recipes/non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Recipe not found"


def test_delete_recipe_success(client):
    # Create a recipe first
    payload = {
        "title": "Tacos",
        "description": "Delicious Mexican tacos.",
        "prep_time": 15,
        "cook_time": 10,
        "servings": 2,
        "instructions": "Assemble tacos.",
        "ingredients": [{"name": "Tortilla", "quantity": "4", "unit": "pieces"}],
    }
    create_resp = client.post("/api/v1/recipes", json=payload)
    recipe_id = create_resp.json()["id"]

    # Delete
    response = client.delete(f"/api/v1/recipes/{recipe_id}")
    assert response.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/v1/recipes/{recipe_id}")
    assert get_resp.status_code == 404


def test_delete_recipe_not_found(client):
    response = client.delete("/api/v1/recipes/non-existent-id")
    assert response.status_code == 404


def test_search_recipes(client):
    # Create two recipes
    recipe1 = {
        "title": "Spaghetti Carbonara",
        "description": "Classic Roman pasta dish.",
        "prep_time": 10,
        "cook_time": 15,
        "servings": 4,
        "instructions": "Cook pasta.",
        "ingredients": [
            {"name": "Spaghetti", "quantity": "400", "unit": "g"},
            {"name": "Guanciale", "quantity": "150", "unit": "g"},
        ],
    }
    recipe2 = {
        "title": "Chocolate Chip Cookies",
        "description": "Delicious baked cookies.",
        "prep_time": 15,
        "cook_time": 12,
        "servings": 24,
        "instructions": "Bake cookies.",
        "ingredients": [
            {"name": "Flour", "quantity": "2", "unit": "cups"},
            {"name": "Chocolate Chips", "quantity": "1", "unit": "cup"},
        ],
    }
    client.post("/api/v1/recipes", json=recipe1)
    client.post("/api/v1/recipes", json=recipe2)

    # Search by title
    response = client.get("/api/v1/recipes?search=Carbonara")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Spaghetti Carbonara"

    # Search by ingredient
    response = client.get("/api/v1/recipes?search=Flour")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Chocolate Chip Cookies"


def test_cors_headers(client):
    response = client.options(
        "/api/v1/recipes",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert (
        response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    )
