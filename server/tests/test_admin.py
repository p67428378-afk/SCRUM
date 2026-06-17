import os
os.environ["TESTING"] = "true"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.app.main import app
from server.app.database import Base, get_db
from server.app import models

# Setup test database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_test_data():
    from server.app.models import Permission, Role
    db = TestingSessionLocal()
    try:
        # Seed permissions
        perms_data = [
            ("View Dashboard", "Can view the security dashboard"),
            ("Manage Users", "Can provision, update, and deactivate users"),
            ("Manage Roles", "Can create roles and assign permissions"),
            ("View Audit Logs", "Can view system audit logs"),
        ]
        perms_map = {}
        for name, desc in perms_data:
            perm = db.query(Permission).filter(Permission.name == name).first()
            if not perm:
                perm = Permission(name=name, description=desc)
                db.add(perm)
                db.commit()
                db.refresh(perm)
            perms_map[name] = perm

        # Seed roles
        roles_data = [
            ("System Administrator", "Full system access", ["View Dashboard", "Manage Users", "Manage Roles", "View Audit Logs"]),
            ("Branch Manager", "Branch management access", ["View Dashboard", "View Audit Logs"]),
            ("Teller", "Basic teller access", ["View Dashboard"]),
        ]
        for name, desc, perm_names in roles_data:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc)
                role.permissions = [perms_map[p_name] for p_name in perm_names]
                db.add(role)
                db.commit()
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    # Force override get_db for this test module
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    seed_test_data()
    yield
    Base.metadata.drop_all(bind=engine)
    # Clean up override
    if get_db in app.dependency_overrides:
        del app.dependency_overrides[get_db]

client = TestClient(app)

def test_create_user_success():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe",
        "status": "ACTIVE"
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "john.doe@example.com"
    assert data["employee_id"] == "EMP100"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["status"] == "ACTIVE"

def test_create_user_duplicate_employee_id():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 201

    payload_dup = {
        "email": "another.email@example.com",
        "employee_id": "EMP100",
        "first_name": "Jane",
        "last_name": "Doe"
    }
    response_dup = client.post("/api/v1/admin/users", json=payload_dup)
    assert response_dup.status_code == 409
    assert "Employee ID already exists" in response_dup.json()["detail"]

def test_create_user_duplicate_email():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 201

    payload_dup = {
        "email": "john.doe@example.com",
        "employee_id": "EMP101",
        "first_name": "Jane",
        "last_name": "Doe"
    }
    response_dup = client.post("/api/v1/admin/users", json=payload_dup)
    assert response_dup.status_code == 409
    assert "Email already exists" in response_dup.json()["detail"]

def test_get_user_not_found():
    response = client.get("/api/v1/admin/users/non-existent-id")
    assert response.status_code == 404

def test_get_user_success():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_res = client.post("/api/v1/admin/users", json=payload)
    user_id = create_res.json()["id"]

    response = client.get(f"/api/v1/admin/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "john.doe@example.com"
    assert "roles" in data
    assert "permissions" in data

def test_update_user_success():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_res = client.post("/api/v1/admin/users", json=payload)
    user_id = create_res.json()["id"]

    update_payload = {
        "email": "john.updated@example.com",
        "first_name": "Johnny",
        "last_name": "Doey",
        "status": "INACTIVE"
    }
    response = client.put(f"/api/v1/admin/users/{user_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "john.updated@example.com"
    assert data["first_name"] == "Johnny"
    assert data["last_name"] == "Doey"
    assert data["status"] == "INACTIVE"

def test_deactivate_user_success():
    payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    create_res = client.post("/api/v1/admin/users", json=payload)
    user_id = create_res.json()["id"]

    response = client.delete(f"/api/v1/admin/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "User deactivated successfully"

    # Verify status is INACTIVE
    get_res = client.get(f"/api/v1/admin/users/{user_id}")
    assert get_res.json()["status"] == "INACTIVE"

def test_create_role_success():
    payload = {
        "name": "Loan Officer",
        "description": "Basic loan officer role"
    }
    response = client.post("/api/v1/admin/roles", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["name"] == "Loan Officer"
    assert data["description"] == "Basic loan officer role"

def test_create_role_duplicate_name():
    payload = {
        "name": "Loan Officer",
        "description": "Basic loan officer role"
    }
    client.post("/api/v1/admin/roles", json=payload)

    response = client.post("/api/v1/admin/roles", json=payload)
    assert response.status_code == 400
    assert "Role name already exists" in response.json()["detail"]

def test_assign_user_roles_success():
    # 1. Create user
    user_payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    user_res = client.post("/api/v1/admin/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Create role
    role_payload = {
        "name": "Loan Officer",
        "description": "Basic loan officer role"
    }
    role_res = client.post("/api/v1/admin/roles", json=role_payload)
    role_id = role_res.json()["id"]

    # 3. Assign role
    assign_payload = {
        "role_ids": [role_id]
    }
    response = client.put(f"/api/v1/admin/users/{user_id}/roles", json=assign_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert len(data["roles"]) == 1
    assert data["roles"][0]["id"] == role_id

def test_get_permissions():
    response = client.get("/api/v1/admin/permissions")
    assert response.status_code == 200
    # Seeded permissions should be returned
    data = response.json()
    assert len(data) > 0
    assert any(p["name"] == "View Dashboard" for p in data)

def test_update_user_permissions_success():
    # 1. Create user
    user_payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    user_res = client.post("/api/v1/admin/users", json=user_payload)
    user_id = user_res.json()["id"]

    # 2. Get seeded permission ID
    perm_res = client.get("/api/v1/admin/permissions")
    perm_id = perm_res.json()[0]["id"]

    # 3. Update user permissions
    payload = {
        "permission_ids": [perm_id]
    }
    response = client.patch(f"/api/v1/admin/users/{user_id}/permissions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert len(data["permissions"]) == 1
    assert data["permissions"][0]["id"] == perm_id

def test_update_role_permissions_success():
    # 1. Create role
    role_payload = {
        "name": "Loan Officer",
        "description": "Basic loan officer role"
    }
    role_res = client.post("/api/v1/admin/roles", json=role_payload)
    role_id = role_res.json()["id"]

    # 2. Get seeded permission ID
    perm_res = client.get("/api/v1/admin/permissions")
    perm_id = perm_res.json()[0]["id"]

    # 3. Update role permissions
    payload = {
        "permission_ids": [perm_id]
    }
    response = client.patch(f"/api/v1/admin/roles/{role_id}/permissions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role_id"] == role_id
    assert len(data["permissions"]) == 1
    assert data["permissions"][0]["id"] == perm_id

def test_dashboard_users_and_roles_and_audit_logs():
    # 1. Create user
    user_payload = {
        "email": "john.doe@example.com",
        "employee_id": "EMP100",
        "first_name": "John",
        "last_name": "Doe"
    }
    client.post("/api/v1/admin/users", json=user_payload)

    # 2. Get dashboard users
    response = client.get("/api/v1/admin/dashboard/users")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(u["employee_id"] == "EMP100" for u in data["users"])

    # 3. Get dashboard roles
    response_roles = client.get("/api/v1/admin/dashboard/roles")
    assert response_roles.status_code == 200
    data_roles = response_roles.json()
    assert data_roles["total"] >= 3 # Seeded roles

    # 4. Get dashboard audit logs
    response_logs = client.get("/api/v1/admin/dashboard/audit-logs")
    assert response_logs.status_code == 200
    data_logs = response_logs.json()
    assert data_logs["total"] >= 1
    assert any(log["action_type"] == "USER_CREATED" for log in data_logs["logs"])
