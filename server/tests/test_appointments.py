from datetime import datetime, timedelta, timezone


def test_available_slots_and_booking_flow(client):
    # Fetch customer, staff, service
    cust_res = client.get("/api/v1/customers").json()
    customer = cust_res[0]

    staff_res = client.get("/api/v1/staff").json()
    sarah = next(s for s in staff_res if "Sarah" in s["full_name"])

    svc_res = client.get("/api/v1/services").json()
    haircut = next(s for s in svc_res if "Haircut" in s["name"])

    # Target date: next Monday
    today = datetime.now(timezone.utc).date()
    days_ahead = (0 - today.weekday()) % 7
    if days_ahead == 0:
        days_ahead = 7
    next_monday = today + timedelta(days=days_ahead)
    date_str = next_monday.strftime("%Y-%m-%d")

    # Query available slots
    slots_res = client.get(
        f"/api/v1/appointments/available-slots?service_id={haircut['id']}&date={date_str}&staff_id={sarah['id']}"
    )
    assert slots_res.status_code == 200
    slots_data = slots_res.json()
    assert "slots" in slots_data
    assert len(slots_data["slots"]) > 0

    first_slot = slots_data["slots"][0]
    slot_start = first_slot["start_time"]

    # Book appointment
    book_payload = {
        "customer_id": customer["id"],
        "staff_id": sarah["id"],
        "service_id": haircut["id"],
        "start_time": slot_start,
    }

    book_res = client.post("/api/v1/appointments", json=book_payload)
    assert book_res.status_code == 201
    appt = book_res.json()
    assert appt["status"] == "booked"
    assert appt["customer_id"] == customer["id"]

    # Double-booking attempt: try booking same staff and time slot again
    double_res = client.post("/api/v1/appointments", json=book_payload)
    assert double_res.status_code == 400
    assert "already booked" in double_res.json()["detail"]

    # Complete appointment
    appt_id = appt["id"]
    complete_res = client.post(f"/api/v1/appointments/{appt_id}/complete")
    assert complete_res.status_code == 200
    completed_appt = complete_res.json()
    assert completed_appt["status"] == "completed"


def test_cancellation_2hour_rule(client):
    cust_res = client.get("/api/v1/customers").json()
    customer = cust_res[0]
    staff_res = client.get("/api/v1/staff").json()
    sarah = staff_res[0]
    svc_res = client.get("/api/v1/services").json()
    haircut = svc_res[0]

    # Create appointment in 1 hour (less than 2 hours from now)
    near_future = datetime.now(timezone.utc) + timedelta(hours=1)

    # We will force-create an appointment or try creating it
    # Note: create_appointment checks working hours, so let's pick a future date > 24 hours for normal cancel test
    far_future = datetime.now(timezone.utc) + timedelta(days=7)
    # Align far_future to Monday 10:00 AM UTC
    days_ahead = (0 - far_future.weekday()) % 7
    target_monday = far_future.date() + timedelta(days=days_ahead)
    booking_time = datetime.combine(
        target_monday, datetime.min.time().replace(hour=10), tzinfo=timezone.utc
    )

    book_res = client.post(
        "/api/v1/appointments",
        json={
            "customer_id": customer["id"],
            "staff_id": sarah["id"],
            "service_id": haircut["id"],
            "start_time": booking_time.isoformat(),
        },
    )
    assert book_res.status_code == 201
    appt_id = book_res.json()["id"]

    # Cancel appointment (> 2 hours advance)
    cancel_res = client.patch(
        f"/api/v1/appointments/{appt_id}/cancel",
        json={"reason": "Need to reschedule"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"
