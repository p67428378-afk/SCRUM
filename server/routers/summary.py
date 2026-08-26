from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category, Transaction
from server.schemas import CategoryBreakdownItem, SummaryResponse

router = APIRouter(prefix="/api/v1/summary", tags=["Summary"])


@router.get("", response_model=SummaryResponse)
def get_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    period: Optional[str] = Query(None, description="Period shortcut: daily, monthly, yearly, all"),
    db: Session = Depends(get_db),
):
    today = date.today()

    if period and not start_date and not end_date:
        period_lower = period.lower()
        if period_lower == "daily":
            start_date = today
            end_date = today
        elif period_lower == "monthly":
            start_date = date(today.year, today.month, 1)
            # next month start minus one day
            if today.month == 12:
                next_month = date(today.year + 1, 1, 1)
            else:
                next_month = date(today.year, today.month + 1, 1)
            end_date = next_month - timedelta(days=1)
        elif period_lower == "yearly":
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 12, 31)

    query = db.query(Transaction)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    transactions = query.all()

    total_income = 0.0
    total_expense = 0.0
    expense_by_category: Dict[str, float] = {}

    for tx in transactions:
        if tx.type == "income":
            total_income += float(tx.amount)
        elif tx.type == "expense":
            total_expense += float(tx.amount)
            expense_by_category[tx.category_id] = (
                expense_by_category.get(tx.category_id, 0.0) + float(tx.amount)
            )

    total_income = round(total_income, 2)
    total_expense = round(total_expense, 2)
    net_balance = round(total_income - total_expense, 2)

    categories = db.query(Category).all()
    cat_map = {c.id: c.name for c in categories}

    category_breakdown: List[CategoryBreakdownItem] = []
    for cat_id, amount in expense_by_category.items():
        cat_name = cat_map.get(cat_id, "Unknown")
        percentage = round((amount / total_expense * 100.0), 2) if total_expense > 0 else 0.0
        category_breakdown.append(
            CategoryBreakdownItem(
                category_id=cat_id,
                category_name=cat_name,
                amount=round(amount, 2),
                percentage=percentage,
            )
        )

    # Sort breakdown descending by amount
    category_breakdown.sort(key=lambda x: x.amount, reverse=True)

    return SummaryResponse(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        category_breakdown=category_breakdown,
    )
