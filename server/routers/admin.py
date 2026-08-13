from datetime import timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from server import models, schemas
from server.database import get_db
from server.dependencies import require_role

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get(
    "/analytics",
    response_model=schemas.AdminAnalyticsResponse,
)
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("Librarian")),
):
    # 1. Most popular genres (by checkout frequency)
    genre_counts = (
        db.query(
            models.Book.genre,
            func.count(models.Loan.id).label("checkout_count"),
        )
        .join(models.Loan, models.Loan.book_id == models.Book.id)
        .group_by(models.Book.genre)
        .order_by(func.count(models.Loan.id).desc())
        .all()
    )

    most_popular_genres = [
        schemas.MostPopularGenreItem(
            genre=row.genre,
            checkout_count=row.checkout_count,
        )
        for row in genre_counts
    ]

    # 2. Turn-around rates (average days between checkout and return for returned loans)
    returned_loans = (
        db.query(models.Loan.checkout_date, models.Loan.return_date)
        .filter(
            models.Loan.status == models.LoanStatus.RETURNED,
            models.Loan.return_date.isnot(None),
        )
        .all()
    )

    total_returned_loans = len(returned_loans)
    if total_returned_loans > 0:
        total_days = 0.0
        for c_date, r_date in returned_loans:
            if c_date and r_date:
                if c_date.tzinfo is None:
                    c_date = c_date.replace(tzinfo=timezone.utc)
                if r_date.tzinfo is None:
                    r_date = r_date.replace(tzinfo=timezone.utc)
                total_days += (r_date - c_date).total_seconds() / 86400.0
        average_turnaround_days = round(total_days / total_returned_loans, 2)
    else:
        average_turnaround_days = 0.0

    turn_around_rates = schemas.TurnAroundRates(
        average_turnaround_days=average_turnaround_days,
        total_returned_loans=total_returned_loans,
    )

    # 3. Active members count
    active_members_count = (
        db.query(models.User)
        .filter(
            models.User.role == models.UserRole.MEMBER,
            models.User.is_active.is_(True),
        )
        .count()
    )

    # 4. Total fines collected (fines with status PAID)
    total_fines = (
        db.query(func.sum(models.Fine.amount))
        .filter(
            models.Fine.status == models.FineStatus.PAID,
        )
        .scalar()
    ) or 0.0

    return schemas.AdminAnalyticsResponse(
        most_popular_genres=most_popular_genres,
        turn_around_rates=turn_around_rates,
        active_members_count=active_members_count,
        total_fines_collected=float(total_fines),
    )
