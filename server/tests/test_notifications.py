import pytest
from server.app.models import Notification


@pytest.fixture(scope="function")
def seed_notifications(db_session, test_guide):
    notif1 = Notification(
        notification_id="notif-1",
        guide_id=test_guide.guide_id,
        message="New booking request from John Doe",
        is_read=False,
    )
    notif2 = Notification(
        notification_id="notif-2",
        guide_id=test_guide.guide_id,
        message="Payment confirmed for Everest Base Camp trek",
        is_read=True,
    )
    db_session.add_all([notif1, notif2])
    db_session.commit()
    return [notif1, notif2]


def test_get_notifications_unauthorized(client):
    response = client.get("/api/v1/notifications")
    assert response.status_code == 401


def test_get_notifications_success(client, auth_headers, seed_notifications):
    response = client.get("/api/v1/notifications", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Ordered by created_at desc, so notif-2 (created second) comes first
    assert data[0]["notification_id"] == "notif-2"
    assert data[1]["notification_id"] == "notif-1"


def test_read_notification_success(
    client, auth_headers, seed_notifications, db_session
):
    response = client.post("/api/v1/notifications/notif-1/read", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["notification_id"] == "notif-1"
    assert data["is_read"] is True

    # Verify in DB
    notif = (
        db_session.query(Notification)
        .filter(Notification.notification_id == "notif-1")
        .first()
    )
    assert notif.is_read is True


def test_read_notification_not_found(client, auth_headers, seed_notifications):
    response = client.post(
        "/api/v1/notifications/nonexistent/read", headers=auth_headers
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"
