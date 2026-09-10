from datetime import datetime, timezone
from typing import Optional

DAILY_FINE_RATE = 0.50
MAX_FINE_CAP = 25.00
SUSPENSION_THRESHOLD = 20.00
STANDARD_MAX_LOANS = 5
PREMIUM_MAX_LOANS = 10
STANDARD_LOAN_DAYS = 14


def calculate_overdue_fine(
    due_date: datetime, return_date: Optional[datetime] = None
) -> float:
    """
    Calculate overdue fine at $0.50 per day past due date, capped at $25.00.
    """
    if return_date is None:
        return_date = datetime.now(timezone.utc)

    # Strip timezone or normalize if needed for comparison
    d1 = return_date.replace(tzinfo=None) if return_date.tzinfo else return_date
    d2 = due_date.replace(tzinfo=None) if due_date.tzinfo else due_date

    if d1 <= d2:
        return 0.0

    days_overdue = (d1.date() - d2.date()).days
    if days_overdue <= 0:
        return 0.0

    fine = round(days_overdue * DAILY_FINE_RATE, 2)
    return min(fine, MAX_FINE_CAP)


def get_tier_borrow_limit(membership_tier: str) -> int:
    tier = (membership_tier or "").upper()
    if tier == "PREMIUM":
        return PREMIUM_MAX_LOANS
    return STANDARD_MAX_LOANS
