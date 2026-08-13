from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from server.database import get_db
from server.models import Room, Reservation, Folio, User
from server.schemas import DashboardMetricsResponse
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard & Analytics"])


@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    total_rooms = db.query(func.count(Room.id)).scalar() or 0
    occupied_rooms = (
        db.query(func.count(Room.id)).filter(Room.status == "Occupied").scalar() or 0
    )
    available_rooms = (
        db.query(func.count(Room.id)).filter(Room.status == "Available").scalar() or 0
    )
    cleaning_rooms = (
        db.query(func.count(Room.id)).filter(Room.status == "Cleaning").scalar() or 0
    )
    maintenance_rooms = (
        db.query(func.count(Room.id)).filter(Room.status == "Maintenance").scalar() or 0
    )

    occupancy_rate = (
        round((occupied_rooms / total_rooms) * 100, 1) if total_rooms > 0 else 0.0
    )

    pending_checkins = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.status == "Confirmed", Reservation.check_in_date <= today)
        .scalar()
        or 0
    )

    scheduled_checkouts = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.status == "Checked-In", Reservation.check_out_date <= today)
        .scalar()
        or 0
    )

    housekeeping_queue = cleaning_rooms

    # Daily revenue from folios with status 'Paid' updated/created today or overall paid
    paid_today_revenue = (
        db.query(func.sum(Folio.total_due))
        .filter(Folio.payment_status == "Paid", cast(Folio.updated_at, Date) == today)
        .scalar()
    )
    if paid_today_revenue is None:
        paid_today_revenue = (
            db.query(func.sum(Folio.total_due))
            .filter(Folio.payment_status == "Paid")
            .scalar()
            or 0.0
        )

    return DashboardMetricsResponse(
        occupancy_rate=occupancy_rate,
        total_rooms=total_rooms,
        occupied_rooms=occupied_rooms,
        available_rooms=available_rooms,
        cleaning_rooms=cleaning_rooms,
        maintenance_rooms=maintenance_rooms,
        pending_checkins=pending_checkins,
        scheduled_checkouts=scheduled_checkouts,
        housekeeping_queue=housekeeping_queue,
        daily_revenue=float(paid_today_revenue),
    )
