from unittest.mock import patch
from server.services.billing_analytics import (
    calculate_pricing_tier,
    record_user_login_event,
)
from server.models.models import User, UserLoginStats, UserActivityLog


def test_calculate_pricing_tier():
    assert calculate_pricing_tier(1) == "Free"
    assert calculate_pricing_tier(5) == "Free"
    assert calculate_pricing_tier(6) == "Standard"
    assert calculate_pricing_tier(20) == "Standard"
    assert calculate_pricing_tier(21) == "Pro"
    assert calculate_pricing_tier(100) == "Pro"
    assert calculate_pricing_tier(101) == "Enterprise"


def test_record_user_login_event(db_session):
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    assert user is not None

    stats = record_user_login_event(user.id, db_session)
    assert stats.login_count >= 1
    assert stats.pricing_tier in ["Free", "Standard", "Pro", "Enterprise"]

    # Verify a USER_LOGIN activity log was recorded
    log = (
        db_session.query(UserActivityLog)
        .filter(
            UserActivityLog.user_id == user.id,
            UserActivityLog.activity_type == "USER_LOGIN",
        )
        .first()
    )
    assert log is not None


def test_login_triggers_billing_analytics(client, db_session):
    response = client.post(
        "/api/v1/users/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

    user = db_session.query(User).filter(User.email == "test@example.com").first()
    stats = (
        db_session.query(UserLoginStats)
        .filter(UserLoginStats.user_id == user.id)
        .first()
    )
    assert stats is not None
    assert stats.login_count >= 1


def test_login_fault_tolerance(client):
    with patch(
        "server.services.billing_analytics.record_user_login_event",
        side_effect=RuntimeError("Billing service offline"),
    ):
        response = client.post(
            "/api/v1/users/login",
            json={"email": "test@example.com", "password": "testpassword"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()


def test_activity_logging_middleware(client, db_session):
    # Unauthenticated request (anonymous)
    res_anon = client.get("/api/v1/products")
    assert res_anon.status_code == 200

    anon_log = (
        db_session.query(UserActivityLog)
        .filter(
            UserActivityLog.endpoint == "/api/v1/products",
            UserActivityLog.user_id == None,
        )
        .first()
    )
    assert anon_log is not None
    assert anon_log.http_method == "GET"

    # Authenticated request
    login_res = client.post(
        "/api/v1/users/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_auth = client.get("/api/v1/users/profile", headers=headers)
    assert res_auth.status_code == 200

    user = db_session.query(User).filter(User.email == "test@example.com").first()
    auth_log = (
        db_session.query(UserActivityLog)
        .filter(
            UserActivityLog.endpoint == "/api/v1/users/profile",
            UserActivityLog.user_id == user.id,
        )
        .first()
    )
    assert auth_log is not None


def test_activity_router_endpoints(client, db_session):
    login_res = client.post(
        "/api/v1/users/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test /api/v1/activity/logs
    logs_res = client.get("/api/v1/activity/logs", headers=headers)
    assert logs_res.status_code == 200
    data = logs_res.json()
    assert "items" in data
    assert "total" in data

    # Test /api/v1/activity/summary
    summary_res = client.get("/api/v1/activity/summary", headers=headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert "login_count" in summary_data
    assert "pricing_tier" in summary_data
