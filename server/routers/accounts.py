from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time, timezone, timedelta
import csv
import io
import calendar
import random
import uuid

from server.database import get_db
from server.models import User, Account, Transaction
from server.schemas import (
    AccountResponse,
    TransactionListResponse,
    StatementResponse,
    StatementDetailResponse,
    AccountCreateRequest,
)
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def get_accounts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts


@router.get("/{accountId}/transactions", response_model=TransactionListResponse)
def get_account_transactions(
    accountId: str,
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify account exists and belongs to user
    account = (
        db.query(Account)
        .filter(Account.id == accountId, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or does not belong to user"
        )

    query = db.query(Transaction).filter(Transaction.account_id == accountId)

    if category:
        query = query.filter(Transaction.category == category)

    if start_date:
        try:
            start_dt = datetime.combine(
                datetime.strptime(start_date, "%Y-%m-%d"), time.min
            )
            query = query.filter(Transaction.date >= start_dt)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD"
            )

    if end_date:
        try:
            end_dt = datetime.combine(datetime.strptime(end_date, "%Y-%m-%d"), time.max)
            query = query.filter(Transaction.date <= end_dt)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD"
            )

    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))

    # Order by date descending for deterministic results
    query = query.order_by(Transaction.date.desc())

    total = query.count()
    transactions = query.offset(skip).limit(limit).all()

    return {"total": total, "transactions": transactions}


@router.post("", response_model=AccountResponse, status_code=201)
def open_account(
    req: AccountCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.account_type not in ["Checking", "Savings"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid account type. Must be Checking or Savings",
        )

    # Generate random masked account number
    random_suffix = f"{random.randint(1000, 9999)}"
    account_number_masked = f"...{random_suffix}"

    account = Account(
        user_id=current_user.id,
        account_type=req.account_type,
        account_number_masked=account_number_masked,
        balance=req.initial_deposit,
        status="active",
    )
    db.add(account)
    db.flush()

    if req.initial_deposit > 0:
        tx = Transaction(
            account_id=account.id,
            description="Initial Deposit",
            category="Deposit",
            amount=req.initial_deposit,
            status="completed",
            reference_id="TXN" + str(uuid.uuid4())[:8].upper(),
        )
        db.add(tx)

    db.commit()
    db.refresh(account)
    return account


@router.get("/{accountId}/statements", response_model=List[StatementResponse])
def get_account_statements(
    accountId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify account exists and belongs to user
    account = (
        db.query(Account)
        .filter(Account.id == accountId, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or does not belong to user"
        )

    # Generate statements dynamically for the last 3 months
    now = datetime.now(timezone.utc)
    statements = []
    for i in range(3):
        year = now.year
        month = now.month - i
        if month <= 0:
            month += 12
            year -= 1

        month_name = calendar.month_name[month]
        period = f"{month_name} {year}"
        stmt_id = f"stmt-{year}-{month:02d}"

        statements.append(
            {
                "id": stmt_id,
                "account_id": account.id,
                "statement_period": period,
                "created_at": datetime(year, month, 1, tzinfo=timezone.utc)
                + timedelta(days=28),
                "download_url": f"/api/v1/accounts/{account.id}/statements/{stmt_id}",
            }
        )
    return statements


@router.get(
    "/{accountId}/statements/{statementId}",
    response_model=StatementDetailResponse,
)
def get_account_statement_detail(
    accountId: str,
    statementId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify account exists and belongs to user
    account = (
        db.query(Account)
        .filter(Account.id == accountId, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or does not belong to user"
        )

    # Parse year and month from statementId
    try:
        parts = statementId.split("-")
        year = int(parts[1])
        month = int(parts[2])
    except (IndexError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid statement ID format")

    # Get start and end dates of the month
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    _, last_day = calendar.monthrange(year, month)
    end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)

    # Query transactions in this period
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.account_id == accountId,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
        )
        .order_by(Transaction.date.desc())
        .all()
    )

    # Calculate starting and ending balance
    current_balance = account.balance
    txs_after = (
        db.query(Transaction)
        .filter(Transaction.account_id == accountId, Transaction.date > end_date)
        .all()
    )
    sum_after = sum(tx.amount for tx in txs_after)
    ending_balance = current_balance - sum_after
    sum_in_period = sum(tx.amount for tx in transactions)
    starting_balance = ending_balance - sum_in_period

    month_name = calendar.month_name[month]
    period = f"{month_name} {year}"

    return {
        "id": statementId,
        "account_id": accountId,
        "statement_period": period,
        "created_at": start_date + timedelta(days=28),
        "starting_balance": starting_balance,
        "ending_balance": ending_balance,
        "transactions": transactions,
    }


@router.get("/{accountId}/transactions/export")
def export_transactions(
    accountId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify account exists and belongs to user
    account = (
        db.query(Account)
        .filter(Account.id == accountId, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=404, detail="Account not found or does not belong to user"
        )

    # Query all transactions for the account
    transactions = (
        db.query(Transaction)
        .filter(Transaction.account_id == accountId)
        .order_by(Transaction.date.desc())
        .all()
    )

    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Transaction ID",
            "Date",
            "Description",
            "Category",
            "Amount",
            "Status",
            "Reference ID",
        ]
    )
    for tx in transactions:
        writer.writerow(
            [
                tx.id,
                tx.date.isoformat(),
                tx.description,
                tx.category,
                float(tx.amount),
                tx.status,
                tx.reference_id,
            ]
        )
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=transactions_{accountId}.csv"
        },
    )
