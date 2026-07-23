from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from server import crud, schemas, database, models
from server.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# --- Funding Accounts ---
@router.get("/accounts", response_model=List[schemas.FundingAccountResponse])
def read_funding_accounts(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.get_funding_accounts(db, user_id=current_user.id)


@router.post("/accounts", response_model=schemas.FundingAccountResponse)
def link_funding_account(
    account: schemas.FundingAccountCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.create_funding_account(db, user_id=current_user.id, account=account)


@router.delete("/accounts/{account_id}")
def unlink_funding_account(
    account_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.delete_funding_account(
        db, user_id=current_user.id, account_id=account_id
    )


# --- Payees ---
@router.get("/payees", response_model=List[schemas.PayeeResponse])
def read_payees(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.get_payees(db)


# --- Recurring Payments ---
@router.get("/recurring", response_model=List[schemas.RecurringPaymentListResponse])
def read_recurring_payments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.get_recurring_payments(db, user_id=current_user.id)


@router.post("/recurring", response_model=schemas.RecurringPaymentResponse)
def create_recurring_payment_schedule(
    payment: schemas.RecurringPaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.create_recurring_payment(db, user_id=current_user.id, payment=payment)


@router.get("/recurring/{schedule_id}", response_model=schemas.RecurringPaymentResponse)
def read_recurring_payment_schedule(
    schedule_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    db_payment = crud.get_recurring_payment(
        db, user_id=current_user.id, schedule_id=schedule_id
    )
    if not db_payment:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return db_payment


@router.put("/recurring/{schedule_id}", response_model=schemas.RecurringPaymentResponse)
def update_recurring_payment_schedule(
    schedule_id: str,
    payment: schemas.RecurringPaymentUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.update_recurring_payment(
        db, user_id=current_user.id, schedule_id=schedule_id, payment=payment
    )


@router.delete("/recurring/{schedule_id}")
def cancel_recurring_payment_schedule(
    schedule_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.cancel_recurring_payment(
        db, user_id=current_user.id, schedule_id=schedule_id
    )


@router.post(
    "/recurring/{schedule_id}/execute",
    response_model=schemas.PaymentTransactionResponse,
)
def execute_payment_schedule(
    schedule_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return crud.execute_recurring_payment(
        db, user_id=current_user.id, schedule_id=schedule_id
    )
