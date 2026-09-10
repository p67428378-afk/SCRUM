from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server import models, schemas


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def find_available_slots(
    db: Session, service_id: str, date_str: str, staff_id: Optional[str] = None
) -> List[schemas.AvailableSlotResponse]:
    # Validate service
    service = db.query(models.Service).filter_by(id=service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Service not found"
        )

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD",
        )

    day_of_week = target_date.weekday()  # 0=Monday, 6=Sunday

    # Query staff members providing this service
    staff_query = db.query(models.Staff).filter(models.Staff.is_active == True)
    if staff_id:
        staff_query = staff_query.filter(models.Staff.id == staff_id)

    staff_list = staff_query.all()
    # Filter staff by service capability
    eligible_staff = [
        s for s in staff_list if any(svc.id == service_id for svc in s.services)
    ]

    available_slots = []
    slot_step = timedelta(minutes=30)
    duration = timedelta(minutes=service.duration_minutes)

    for staff_member in eligible_staff:
        # Find staff schedule for target_date's day_of_week
        schedule = (
            db.query(models.StaffSchedule)
            .filter_by(staff_id=staff_member.id, day_of_week=day_of_week)
            .first()
        )
        if not schedule:
            continue

        shift_start = datetime.combine(
            target_date, schedule.start_time, tzinfo=timezone.utc
        )
        shift_end = datetime.combine(
            target_date, schedule.end_time, tzinfo=timezone.utc
        )

        break_start = (
            datetime.combine(target_date, schedule.break_start, tzinfo=timezone.utc)
            if schedule.break_start
            else None
        )
        break_end = (
            datetime.combine(target_date, schedule.break_end, tzinfo=timezone.utc)
            if schedule.break_end
            else None
        )

        # Existing appointments for staff on target_date
        existing_appts = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.staff_id == staff_member.id,
                models.Appointment.status != "cancelled",
            )
            .all()
        )

        curr_time = shift_start
        while curr_time + duration <= shift_end:
            slot_start = curr_time
            slot_end = curr_time + duration

            # Check break overlap
            has_break_conflict = False
            if break_start and break_end:
                if not (slot_end <= break_start or slot_start >= break_end):
                    has_break_conflict = True

            # Check appointment overlap
            has_appt_conflict = False
            if not has_break_conflict:
                for appt in existing_appts:
                    appt_start = appt.start_time
                    appt_end = appt.end_time
                    # Ensure appt_start/end are timezone-aware for comparison
                    if appt_start.tzinfo is None:
                        appt_start = appt_start.replace(tzinfo=timezone.utc)
                    if appt_end.tzinfo is None:
                        appt_end = appt_end.replace(tzinfo=timezone.utc)

                    if not (slot_end <= appt_start or slot_start >= appt_end):
                        has_appt_conflict = True
                        break

            if not has_break_conflict and not has_appt_conflict:
                available_slots.append(
                    schemas.AvailableSlotResponse(
                        start_time=slot_start,
                        end_time=slot_end,
                        staff_id=staff_member.id,
                        staff_name=staff_member.full_name,
                        service_id=service_id,
                    )
                )

            curr_time += slot_step

    return available_slots


def create_appointment(
    db: Session,
    customer_id: str,
    staff_id: str,
    service_id: str,
    start_time: datetime,
) -> models.Appointment:
    # Verify Customer
    customer = db.query(models.Customer).filter_by(id=customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found"
        )

    # Verify Staff
    staff_member = db.query(models.Staff).filter_by(id=staff_id).first()
    if not staff_member or not staff_member.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found or inactive",
        )

    # Verify Service
    service = db.query(models.Service).filter_by(id=service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Service not found"
        )

    # Ensure service capability
    if not any(svc.id == service_id for svc in staff_member.services):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff member does not provide the selected service",
        )

    # Timezone normalization
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    duration = timedelta(minutes=service.duration_minutes)
    end_time = start_time + duration

    # Check staff schedule
    day_of_week = start_time.weekday()
    schedule = (
        db.query(models.StaffSchedule)
        .filter_by(staff_id=staff_id, day_of_week=day_of_week)
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Staff member is not working on this day of week",
        )

    # Verify start_time and end_time within working hours
    target_date = start_time.date()
    shift_start = datetime.combine(
        target_date, schedule.start_time, tzinfo=timezone.utc
    )
    shift_end = datetime.combine(target_date, schedule.end_time, tzinfo=timezone.utc)

    if start_time < shift_start or end_time > shift_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested slot is outside staff working hours",
        )

    # Check break time
    if schedule.break_start and schedule.break_end:
        break_start = datetime.combine(
            target_date, schedule.break_start, tzinfo=timezone.utc
        )
        break_end = datetime.combine(
            target_date, schedule.break_end, tzinfo=timezone.utc
        )
        if not (end_time <= break_start or start_time >= break_end):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested slot overlaps with staff break time",
            )

    # Check for existing staff overlapping bookings (Double-booking prevention)
    existing_staff_appts = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.staff_id == staff_id,
            models.Appointment.status != "cancelled",
        )
        .all()
    )

    for appt in existing_staff_appts:
        a_start = (
            appt.start_time
            if appt.start_time.tzinfo
            else appt.start_time.replace(tzinfo=timezone.utc)
        )
        a_end = (
            appt.end_time
            if appt.end_time.tzinfo
            else appt.end_time.replace(tzinfo=timezone.utc)
        )
        if not (end_time <= a_start or start_time >= a_end):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff member is already booked during this time slot",
            )

    # Create appointment
    new_appt = models.Appointment(
        customer_id=customer_id,
        staff_id=staff_id,
        service_id=service_id,
        start_time=start_time,
        end_time=end_time,
        status="booked",
    )
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return new_appt


def cancel_appointment(
    db: Session, appointment_id: str, reason: Optional[str] = None, force: bool = False
) -> models.Appointment:
    appt = db.query(models.Appointment).filter_by(id=appointment_id).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    if appt.status == "cancelled":
        return appt

    now = utc_now()
    appt_start = appt.start_time
    if appt_start.tzinfo is None:
        appt_start = appt_start.replace(tzinfo=timezone.utc)

    # Enforce 2-hour cancellation rule unless forced
    if not force:
        if appt_start - now < timedelta(hours=2):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cancellation attempted less than 2 hours before appointment time",
            )

    appt.status = "cancelled"
    appt.cancellation_reason = reason or "Cancelled by client"
    appt.updated_at = utc_now()
    db.commit()
    db.refresh(appt)
    return appt


def complete_appointment(db: Session, appointment_id: str) -> models.Appointment:
    appt = db.query(models.Appointment).filter_by(id=appointment_id).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    if appt.status == "completed":
        return appt

    appt.status = "completed"
    appt.updated_at = utc_now()

    # Accrue loyalty points
    service = appt.service
    if service and service.loyalty_points_earned > 0:
        customer = appt.customer
        if customer:
            customer.loyalty_points += service.loyalty_points_earned
            tx = models.LoyaltyTransaction(
                customer_id=customer.id,
                appointment_id=appt.id,
                points_change=service.loyalty_points_earned,
                transaction_type="accrual",
                description=f"Points earned for {service.name}",
            )
            db.add(tx)

    db.commit()
    db.refresh(appt)
    return appt
