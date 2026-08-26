from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Category, Transaction
from server.schemas import CategoryBreakdownItem, SummaryResponse

router = APIRouter(prefix="/api/v1/summary", tags=["Summary & Analytics"])


@router.get("", response_model=SummaryResponse)
def get_summary(
    start_date: Optional[date] = Query(None, description="Start date for summary"),
    end_date: Optional[date] = Query(None, description="End date for summary"),
    period: Optional[str] = Query(
        None, description="Period filter: daily, monthly, yearly"
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)

    # Handle period presets if explicit start/end dates are not provided
    if period and not start_date and not end_date:
        today = date.today()
        if period == "daily":
            query = query.filter(Transaction.date == today)
        elif period == "monthly":
            start_of_month = today.replace(day=1)
            query = query.filter(
                Transaction.date >= start_of_month, Transaction.date <= today
            )
        elif period == "yearly":
            start_of_year = today.replace(month=1, day=1)
            query = query.filter(
                Transaction.date >= start_of_year, Transaction.date <= today
            )
    else:
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)

    transactions = query.all()

    total_income = 0.0
    total_expense = 0.0

    # Calculate totals
    for tx in transactions:
        if tx.type == "income":
            total_income += float(tx.amount)
        elif tx.type == "expense":
            total_expense += float(tx.amount)

    total_income = round(total_income, 2)
    total_expense = round(total_expense, 2)
    net_balance = round(total_income - total_expense, 2)

    # Category breakdown for expenses
    category_totals = {}
    for tx in transactions:
        if tx.type == "expense":
            cat_id = tx.category_id
            if cat_id not in category_totals:
                category_totals[cat_id] = 0.0
            category_totals[cat_id] += float(tx.amount)

    category_breakdown = []
    if category_totals:
        categories = (
            db.query(Category).filter(Category.id.in_(category_totals.keys())).all()
        )
        cat_map = {c.id: c.name for c in categories}

        for cat_id, amt in category_totals.items():
            amt_rounded = round(amt, 2)
            pct = (
                round((amt_rounded / total_expense) * 100, 2)
                if total_expense > 0
                else 0.0
            )
            category_breakdown.append(
                CategoryBreakdownItem(
                    category_id=cat_id,
                    category_name=cat_map.get(cat_id, "Unknown"),
                    amount=amt_rounded,
                    percentage=pct,
                )
            )

        # Sort breakdown by amount descending
        category_breakdown.sort(key=lambda x: x.amount, reverse=True)

    return SummaryResponse(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        category_breakdown=category_breakdown,
    )
