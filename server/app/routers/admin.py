from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from server.app.database import get_db
from server.app.models import User, Booking, Donation, Pooja, PoojaSlot, Announcement
from server.app.schemas import (
    DashboardSummaryOut,
    FinancialReportOut,
    AnnouncementCreate,
    AnnouncementOut,
    PoojaCreate,
    PoojaOut,
)
from server.app.utils.security import require_roles

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Operational Dashboard"])


@router.get("/dashboard", response_model=DashboardSummaryOut)
def get_admin_dashboard(
    current_user: User = Depends(require_roles(["Admin", "Staff"])),
    db: Session = Depends(get_db),
):
    today = date.today()

    # Daily bookings count
    daily_bookings_count = (
        db.query(Booking)
        .join(PoojaSlot)
        .filter(PoojaSlot.slot_date == today, Booking.status == "Confirmed")
        .count()
    )

    # Total collections (Donations + Bookings)
    donations_sum = db.query(func.coalesce(func.sum(Donation.amount), 0.0)).scalar()
    bookings_sum = (
        db.query(func.coalesce(func.sum(Booking.amount_paid), 0.0))
        .filter(Booking.status == "Confirmed")
        .scalar()
    )
    total_collections = float(donations_sum) + float(bookings_sum)

    # Expected devotees today
    expected_devotees = (
        db.query(func.coalesce(func.sum(PoojaSlot.booked_count), 0))
        .filter(PoojaSlot.slot_date == today)
        .scalar()
    )

    # Active rituals count
    active_rituals = db.query(Pooja).filter(Pooja.is_active == True).count()

    # Recent bookings & donations
    recent_bookings = (
        db.query(Booking).order_by(Booking.created_at.desc()).limit(10).all()
    )
    recent_donations = (
        db.query(Donation).order_by(Donation.created_at.desc()).limit(10).all()
    )

    return DashboardSummaryOut(
        daily_bookings_count=daily_bookings_count,
        total_collections=total_collections,
        expected_devotees=int(expected_devotees),
        active_rituals=active_rituals,
        recent_bookings=recent_bookings,
        recent_donations=recent_donations,
    )


@router.get("/financial-report", response_model=FinancialReportOut)
def get_financial_report(
    current_user: User = Depends(require_roles(["Admin"])),
    db: Session = Depends(get_db),
):
    donations_sum = db.query(func.coalesce(func.sum(Donation.amount), 0.0)).scalar()
    bookings_sum = (
        db.query(func.coalesce(func.sum(Booking.amount_paid), 0.0))
        .filter(Booking.status == "Confirmed")
        .scalar()
    )

    donations_count = db.query(Donation).count()
    bookings_count = db.query(Booking).filter(Booking.status == "Confirmed").count()

    # Payment methods breakdown
    pm_query = (
        db.query(Donation.payment_method, func.sum(Donation.amount))
        .group_by(Donation.payment_method)
        .all()
    )

    payment_methods_summary = {method: float(amt) for method, amt in pm_query if method}

    total_donations = float(donations_sum)
    total_bookings = float(bookings_sum)
    total_revenue = total_donations + total_bookings

    return FinancialReportOut(
        total_donations_amount=total_donations,
        total_bookings_amount=total_bookings,
        total_revenue=total_revenue,
        donations_count=donations_count,
        bookings_count=bookings_count,
        payment_methods_summary=payment_methods_summary,
    )


@router.post(
    "/announcements",
    response_model=AnnouncementOut,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    announcement_in: AnnouncementCreate,
    current_user: User = Depends(require_roles(["Admin", "Staff"])),
    db: Session = Depends(get_db),
):
    announcement = Announcement(
        title=announcement_in.title,
        message=announcement_in.message,
        created_by=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/announcements", response_model=List[AnnouncementOut])
def list_announcements(db: Session = Depends(get_db)):
    announcements = (
        db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    )
    return announcements


@router.post("/rituals", response_model=PoojaOut, status_code=status.HTTP_201_CREATED)
def create_ritual(
    pooja_in: PoojaCreate,
    current_user: User = Depends(require_roles(["Admin"])),
    db: Session = Depends(get_db),
):
    existing = db.query(Pooja).filter(Pooja.title == pooja_in.title).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A ritual/pooja with this title already exists",
        )

    pooja = Pooja(
        title=pooja_in.title,
        description=pooja_in.description,
        price=pooja_in.price,
        duration_minutes=pooja_in.duration_minutes,
        is_active=True,
    )
    db.add(pooja)
    db.commit()
    db.refresh(pooja)
    return pooja
