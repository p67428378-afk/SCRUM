import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.database import Base, get_db
from server.main import app
from server import models

# Setup in-memory SQLite database for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Seed default permissions and roles for testing
    db = TestingSessionLocal()
    p1 = models.Permission(name="View Reports", description="View reports")
    p2 = models.Permission(name="Manage Users", description="Manage users")
    db.add_all([p1, p2])
    db.commit()
    
    r1 = models.Role(name="Teller", description="Teller role")
    r2 = models.Role(name="Administrator", description="Admin role")
    db.add_all([r1, r2])
    db.commit()
    
    r1.permissions = [p1]
    r2.permissions = [p1, p2]
    db.commit()
    db.close()
    yield

client = TestClient(app)

def test_create_user_success():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "John",
        "last_name": "Doe",
        "status": "active"
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 201

def test_create_user_duplicate_employee_id():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "John",
        "last_name": "Doe"
    }
    client.post("/api/v1/admin/users", json=payload)
    
    # Duplicate employee_id
    payload2 = {
        "email": f"jane.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "Jane",
        "last_name": "Doe"
    }
    response = client.post("/api/v1/admin/users", json=payload2)
    assert response.status_code == 409

def test_create_user_missing_mandatory_fields():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}"
        # missing first_name and last_name
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 422

def test_assign_user_roles():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_resp = client.post("/api/v1/admin/users", json=payload)
    user_id = create_resp.json()["id"]
    
    # Query roles directly from DB
    db = TestingSessionLocal()
    roles = db.query(models.Role).all()
    role_ids = [r.id for r in roles]
    db.close()
    
    # Assign roles
    assign_payload = {
        "role_ids": role_ids
    }
    response = client.put(f"/api/v1/admin/users/{user_id}/roles", json=assign_payload)
    assert response.status_code == 200

def test_assign_non_existent_roles():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_resp = client.post("/api/v1/admin/users", json=payload)
    user_id = create_resp.json()["id"]
    
    assign_payload = {
        "role_ids": [str(uuid.uuid4())]
    }
    response = client.put(f"/api/v1/admin/users/{user_id}/roles", json=assign_payload)
    assert response.status_code == 400

def test_modify_user_permissions():
    suffix = uuid.uuid4().hex[:4]
    payload = {
        "email": f"john.doe_{suffix}@example.com",
        "employee_id": f"EMP_{suffix}",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_resp = client.post("/api/v1/admin/users", json=payload)
    user_id = create_resp.json()["id"]
    
    # Query permissions directly from DB
    db = TestingSessionLocal()
    permissions = db.query(models.Permission).all()
    perm_ids = [p.id for p in permissions]
    db.close()
    
    # Modify permissions
    modify_payload = {
        "permission_ids": perm_ids
    }
    response = client.patch(f"/api/v1/admin/users/{user_id}/permissions", json=modify_payload)
    assert response.status_code == 200

def test_modify_role_permissions():
    # Query roles and permissions directly from DB
    db = TestingSessionLocal()
    role = db.query(models.Role).first()
    role_id = role.id
    permissions = db.query(models.Permission).all()
    perm_ids = [p.id for p in permissions]
    db.close()
    
    # Modify permissions
    modify_payload = {
        "permission_ids": perm_ids
    }
    response = client.patch(f"/api/v1/admin/roles/{role_id}/permissions", json=modify_payload)
    assert response.status_code == 200

def test_dashboard_users():
    suffix = uuid.uuid4().hex[:4]
    client.post("/api/v1/admin/users", json={
        "email": f"alice_{suffix}@example.com",
        "employee_id": f"EMP1_{suffix}",
        "first_name": "Alice",
        "last_name": "Smith"
    })
    
    response = client.get(f"/api/v1/admin/dashboard/users?search=Alice")
    assert response.status_code == 200

def test_audit_logging():
    suffix = uuid.uuid4().hex[:4]
    client.post("/api/v1/admin/users", json={
        "email": f"alice_{suffix}@example.com",
        "employee_id": f"EMP1_{suffix}",
        "first_name": "Alice",
        "last_name": "Smith"
    })
    
    # Query audit logs directly from DB
    db = TestingSessionLocal()
    logs = db.query(models.AuditLog).all()
    assert len(logs) >= 1
    db.close()