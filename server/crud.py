from sqlalchemy.orm import Session
from server import models, schemas
import bcrypt
from fastapi import HTTPException
from datetime import date, timedelta
import uuid


# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserRegister):
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")
    db_user = models.User(
        email=user.email, name=user.name, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- Funding Account CRUD ---
def get_funding_accounts(db: Session, user_id: str):
    return (
        db.query(models.FundingAccount)
        .filter(
            models.FundingAccount.user_id == user_id,
            models.FundingAccount.is_active == True,
        )
        .all()
    )


def create_funding_account(
    db: Session, user_id: str, account: schemas.FundingAccountCreate
):
    # Validate account number and routing number
    if not account.account_number.isdigit() or len(account.account_number) < 4:
        raise HTTPException(status_code=400, detail="Invalid account number")
    if not account.routing_number.isdigit() or len(account.routing_number) != 9:
        raise HTTPException(status_code=400, detail="Invalid routing number")

    account_number_last4 = account.account_number[-4:]
    db_account = models.FundingAccount(
        user_id=user_id,
        account_type=account.account_type,
        account_provider=account.account_provider,
        account_number_last4=account_number_last4,
        encrypted_token=f"token_{uuid.uuid4().hex}",  # Mock encrypted token
        balance=1000.00,  # Default balance
        is_active=True,
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def delete_funding_account(db: Session, user_id: str, account_id: str):
    db_account = (
        db.query(models.FundingAccount)
        .filter(
            models.FundingAccount.id == account_id,
            models.FundingAccount.user_id == user_id,
        )
        .first()
    )
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Soft delete or hard delete? Let's do soft delete or hard delete.
    # The schema has is_active, so let's do soft delete.
    db_account.is_active = False
    db_account.updated_at = date.today()
    db.commit()
    return {"status": "success"}


# --- Payee CRUD ---
def get_payees(db: Session):
    return db.query(models.Payee).all()


# --- Recurring Payment CRUD ---
def get_recurring_payments(db: Session, user_id: str):
    return (
        db.query(models.RecurringPayment)
        .filter(
            models.RecurringPayment.user_id == user_id,
            models.RecurringPayment.is_active == True,
        )
        .all()
    )


def get_recurring_payment(db: Session, user_id: str, schedule_id: str):
    return (
        db.query(models.RecurringPayment)
        .filter(
            models.RecurringPayment.id == schedule_id,
            models.RecurringPayment.user_id == user_id,
            models.RecurringPayment.is_active == True,
        )
        .first()
    )


def calculate_next_payment_date(start_date: date, frequency: str) -> date:
    today = date.today()
    next_date = start_date
    while next_date < today:
        if frequency == "WEEKLY":
            next_date += timedelta(weeks=1)
        elif frequency == "MONTHLY":
            # Simple month addition
            if next_date.month == 12:
                next_date = date(next_date.year + 1, 1, next_date.day)
            else:
                # Handle end of month days
                try:
                    next_date = date(next_date.year, next_date.month + 1, next_date.day)
                except ValueError:
                    # If day doesn't exist in next month, use last day of next month
                    next_date = date(
                        next_date.year, next_date.month + 2, 1
                    ) - timedelta(days=1)
        elif frequency == "ANNUALLY":
            try:
                next_date = date(next_date.year + 1, next_date.month, next_date.day)
            except ValueError:
                next_date = date(next_date.year + 1, next_date.month, next_date.day - 1)
    return next_date


def validate_splits(db: Session, user_id: str, amount: float, splits: list):
    if not splits:
        raise HTTPException(status_code=400, detail="At least one split is required")

    total_percentage = 0.0
    total_fixed = 0.0
    split_types = set()

    for split in splits:
        # Verify funding account exists and belongs to user
        acc = (
            db.query(models.FundingAccount)
            .filter(
                models.FundingAccount.id == split.funding_account_id,
                models.FundingAccount.user_id == user_id,
                models.FundingAccount.is_active == True,
            )
            .first()
        )
        if not acc:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid funding account: {split.funding_account_id}",
            )

        split_types.add(split.split_type)
        if split.split_type == "PERCENTAGE":
            total_percentage += split.split_value
        elif split.split_type == "FIXED":
            total_fixed += split.split_value

    if len(split_types) > 1:
        raise HTTPException(
            status_code=400, detail="Cannot mix PERCENTAGE and FIXED split types"
        )

    if "PERCENTAGE" in split_types:
        if abs(total_percentage - 100.0) > 0.01:
            raise HTTPException(
                status_code=400, detail="Percentage splits must sum to exactly 100%"
            )
    elif "FIXED" in split_types:
        if abs(total_fixed - amount) > 0.01:
            raise HTTPException(
                status_code=400,
                detail="Fixed splits must sum to exactly the payment amount",
            )


def create_recurring_payment(
    db: Session, user_id: str, payment: schemas.RecurringPaymentCreate
):
    # Validate payee exists
    payee = db.query(models.Payee).filter(models.Payee.id == payment.payee_id).first()
    if not payee:
        raise HTTPException(status_code=400, detail="Invalid payee_id")

    # Validate splits
    validate_splits(db, user_id, payment.amount, payment.splits)

    next_payment_date = calculate_next_payment_date(
        payment.start_date, payment.frequency
    )

    db_payment = models.RecurringPayment(
        user_id=user_id,
        payee_id=payment.payee_id,
        description=payment.description,
        amount=payment.amount,
        currency=payment.currency,
        frequency=payment.frequency,
        start_date=payment.start_date,
        next_payment_date=next_payment_date,
        is_active=True,
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    # Create splits
    for split in payment.splits:
        db_split = models.PaymentSplit(
            recurring_payment_id=db_payment.id,
            funding_account_id=split.funding_account_id,
            split_type=split.split_type,
            split_value=split.split_value,
        )
        db.add(db_split)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def update_recurring_payment(
    db: Session, user_id: str, schedule_id: str, payment: schemas.RecurringPaymentUpdate
):
    db_payment = (
        db.query(models.RecurringPayment)
        .filter(
            models.RecurringPayment.id == schedule_id,
            models.RecurringPayment.user_id == user_id,
            models.RecurringPayment.is_active == True,
        )
        .first()
    )
    if not db_payment:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # Validate splits
    validate_splits(db, user_id, payment.amount, payment.splits)

    next_payment_date = calculate_next_payment_date(
        payment.start_date, payment.frequency
    )

    db_payment.amount = payment.amount
    db_payment.currency = payment.currency
    db_payment.description = payment.description
    db_payment.frequency = payment.frequency
    db_payment.start_date = payment.start_date
    db_payment.next_payment_date = next_payment_date
    db_payment.updated_at = date.today()

    # Delete old splits
    db.query(models.PaymentSplit).filter(
        models.PaymentSplit.recurring_payment_id == schedule_id
    ).delete()

    # Create new splits
    for split in payment.splits:
        db_split = models.PaymentSplit(
            recurring_payment_id=db_payment.id,
            funding_account_id=split.funding_account_id,
            split_type=split.split_type,
            split_value=split.split_value,
        )
        db.add(db_split)

    db.commit()
    db.refresh(db_payment)
    return db_payment


def cancel_recurring_payment(db: Session, user_id: str, schedule_id: str):
    db_payment = (
        db.query(models.RecurringPayment)
        .filter(
            models.RecurringPayment.id == schedule_id,
            models.RecurringPayment.user_id == user_id,
            models.RecurringPayment.is_active == True,
        )
        .first()
    )
    if not db_payment:
        raise HTTPException(status_code=404, detail="Schedule not found")

    db_payment.is_active = False
    db_payment.updated_at = date.today()
    db.commit()
    return {"status": "success"}


def send_notification(user_id: str, message: str):
    # Mock notification sending (e.g., email, SMS, or push alert)
    print(f"NOTIFICATION to User {user_id}: {message}")


def execute_recurring_payment(db: Session, user_id: str, schedule_id: str):
    db_payment = (
        db.query(models.RecurringPayment)
        .filter(
            models.RecurringPayment.id == schedule_id,
            models.RecurringPayment.user_id == user_id,
            models.RecurringPayment.is_active == True,
        )
        .first()
    )
    if not db_payment:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # Calculate split amounts and check balances
    total_amount = float(db_payment.amount)
    splits = db_payment.splits

    # Check if all funding accounts have enough balance
    can_execute = True
    split_details = []

    for split in splits:
        acc = (
            db.query(models.FundingAccount)
            .filter(
                models.FundingAccount.id == split.funding_account_id,
                models.FundingAccount.is_active == True,
            )
            .first()
        )

        if not acc:
            can_execute = False
            break

        # Calculate split amount
        if split.split_type == "PERCENTAGE":
            split_amount = total_amount * (float(split.split_value) / 100.0)
        else:
            split_amount = float(split.split_value)

        if float(acc.balance) < split_amount:
            can_execute = False

        split_details.append((acc, split_amount))

    if can_execute:
        # Deduct balances
        for acc, split_amount in split_details:
            acc.balance = float(acc.balance) - split_amount
        status = "SUCCESS"
        send_notification(
            user_id,
            f"Your recurring payment of {total_amount} USD to {db_payment.payee.name} was successfully processed.",
        )
    else:
        status = "FAILED"
        send_notification(
            user_id,
            f"Your recurring payment of {total_amount} USD to {db_payment.payee.name} failed due to insufficient funds.",
        )

    # Create transaction
    db_transaction = models.PaymentTransaction(
        recurring_payment_id=db_payment.id,
        amount=db_payment.amount,
        status=status,
        gateway_transaction_id=f"gtxn_{uuid.uuid4().hex}"
        if status == "SUCCESS"
        else None,
    )
    db.add(db_transaction)

    # Update next payment date
    if status == "SUCCESS":
        db_payment.next_payment_date = calculate_next_payment_date(
            db_payment.next_payment_date, db_payment.frequency
        )

    db.commit()
    db.refresh(db_transaction)
    return db_transaction
