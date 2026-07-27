import datetime
import random
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.config import settings
from server.database import get_db
from server.models.banking import (
    Account,
    AlertPreference,
    Payee,
    Transaction,
    Message,
    Alert,
)
from server.models.user import User
from server.routers.sessions import get_current_user_and_session
from server.schemas.banking import (
    AccountResponse,
    AlertPreferencesResponse,
    AlertPreferencesUpdateRequest,
    ExternalTransferRequest,
    ExternalTransferResponse,
    InternalTransferRequest,
    InternalTransferResponse,
    LimitsResponse,
    PayeeCreateRequest,
    PayeeResponse,
    PayeeVerifyRequest,
    TransactionListResponse,
    TransactionResponse,
    MessageResponse,
    MessageCreateRequest,
    AlertResponse,
    ProfileResponse,
    ContactChangeRequest,
    ContactVerifyRequest,
)
from server.utils.audit import log_event
from server.utils.idempotency import check_idempotency, save_idempotency_response
from server.utils.security import verified_step_up_sessions

router = APIRouter(tags=["banking"])


def get_current_user(current_data=Depends(get_current_user_and_session)):
    user, session = current_data
    return user


def generate_unique_account_number(db: Session) -> str:
    while True:
        account_number = "".join(random.choices("0123456789", k=10))
        exists = (
            db.query(Account).filter(Account.account_number == account_number).first()
        )
        if not exists:
            return account_number


def ensure_user_accounts(db: Session, user_id: UUID):
    # Check if user has any accounts. If not, seed default accounts.
    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    if not accounts:
        checking_num = generate_unique_account_number(db)
        checking = Account(
            id=uuid.uuid4(),
            user_id=user_id,
            account_number=checking_num,
            account_type="checking",
            balance=12450.82,
            available_balance=12450.82,
            currency="USD",
            status="active",
        )
        savings_num = generate_unique_account_number(db)
        savings = Account(
            id=uuid.uuid4(),
            user_id=user_id,
            account_number=savings_num,
            account_type="savings",
            balance=45120.45,
            available_balance=45120.45,
            currency="USD",
            status="active",
        )
        credit_num = generate_unique_account_number(db)
        credit = Account(
            id=uuid.uuid4(),
            user_id=user_id,
            account_number=credit_num,
            account_type="credit",
            balance=1240.15,
            available_balance=8759.85,  # limit 10000
            currency="USD",
            status="active",
        )
        db.add_all([checking, savings, credit])
        db.commit()
        accounts = [checking, savings, credit]
    return accounts


@router.get("/api/v1/accounts", response_model=list[AccountResponse])
def list_accounts(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    accounts = ensure_user_accounts(db, current_user.id)
    return accounts


@router.get("/api/v1/accounts/{id}", response_model=AccountResponse)
def get_account(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = (
        db.query(Account)
        .filter(Account.id == id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )
    return account


@router.get(
    "/api/v1/accounts/{id}/transactions", response_model=TransactionListResponse
)
def get_transactions(
    id: UUID,
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    type: str | None = Query(None),
    payee: str | None = Query(None),
    limit: int = Query(20),
    skip: int = Query(0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = (
        db.query(Account)
        .filter(Account.id == id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Account not found"
        )

    query = db.query(Transaction).filter(Transaction.account_id == id)

    if amount_min is not None:
        query = query.filter(Transaction.amount >= amount_min)
    if amount_max is not None:
        query = query.filter(Transaction.amount <= amount_max)
    if date_from:
        try:
            dt_from = datetime.datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Transaction.created_at >= dt_from)
        except ValueError:
            pass
    if date_to:
        try:
            dt_to = datetime.datetime.strptime(
                date_to, "%Y-%m-%d"
            ) + datetime.timedelta(days=1)
            query = query.filter(Transaction.created_at < dt_to)
        except ValueError:
            pass
    if type:
        query = query.filter(Transaction.type == type)
    if payee:
        query = query.filter(Transaction.description.ilike(f"%{payee}%"))

    total = query.count()
    items = (
        query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    )

    # Map Transaction model to TransactionResponse schema
    response_items = []
    for item in items:
        response_items.append(
            TransactionResponse(
                id=item.id,
                date=item.created_at,
                description=item.description,
                category=item.category,
                amount=float(item.amount),
                type=item.type,
                status=item.status,
            )
        )

    return TransactionListResponse(
        items=response_items, total=total, limit=limit, skip=skip
    )


def check_limits_and_update(db: Session, user_id: UUID, amount: float):
    # Enforce daily and per-transaction limits
    # Default limits: per-transaction $5,000, daily $10,000
    per_txn_limit = 5000.0
    daily_limit = 10000.0

    if amount > per_txn_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction amount exceeds per-transaction limit of ${per_txn_limit:,.2f}",
        )

    # Calculate daily total
    now = datetime.datetime.now(datetime.timezone.utc)
    start_of_day = datetime.datetime(
        now.year, now.month, now.day, tzinfo=datetime.timezone.utc
    )

    # Sum up all money-movement transactions for the user today
    user_accounts = db.query(Account).filter(Account.user_id == user_id).all()
    account_ids = [acc.id for acc in user_accounts]

    today_txns = (
        db.query(Transaction)
        .filter(
            Transaction.account_id.in_(account_ids),
            Transaction.created_at >= start_of_day,
            Transaction.type.in_(["transfer_out", "payment"]),
            Transaction.status == "completed",
        )
        .all()
    )

    today_total = sum(float(t.amount) for t in today_txns)
    if today_total + amount > daily_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction exceeds daily limit of ${daily_limit:,.2f}. Remaining daily limit: ${max(0.0, daily_limit - today_total):,.2f}",
        )


def check_and_trigger_alerts(
    db: Session, user: User, account: Account, amount: float, txn_type: str
):
    from server.models.banking import Alert, AlertPreference
    from server.utils.notifications import send_email, send_sms

    prefs = db.query(AlertPreference).filter(AlertPreference.user_id == user.id).first()
    if not prefs:
        prefs = AlertPreference(
            id=uuid.uuid4(),
            user_id=user.id,
            push_enabled=True,
            sms_enabled=True,
            email_enabled=True,
            low_balance_threshold=100.00,
            large_transaction_threshold=1000.00,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    # 1. Large transaction alert
    if amount >= float(prefs.large_transaction_threshold):
        msg_text = f"Large transaction alert: A {txn_type} of ${amount:,.2f} was processed on your account {account.account_number}."
        alert = Alert(
            id=uuid.uuid4(),
            user_id=user.id,
            type="large_transaction",
            message=msg_text,
            channel="all",
            is_delivered=True,
        )
        db.add(alert)
        db.commit()

        if prefs.email_enabled:
            send_email(user.email, "Security Alert: Large Transaction", msg_text)
        if prefs.sms_enabled and user.phone_number:
            send_sms(user.phone_number, msg_text)

    # 2. Low balance alert
    if float(account.available_balance) < float(prefs.low_balance_threshold):
        msg_text = f"Low balance alert: Your account {account.account_number} balance has fallen to ${float(account.available_balance):,.2f}, which is below your threshold of ${float(prefs.low_balance_threshold):,.2f}."
        alert = Alert(
            id=uuid.uuid4(),
            user_id=user.id,
            type="low_balance",
            message=msg_text,
            channel="all",
            is_delivered=True,
        )
        db.add(alert)
        db.commit()

        if prefs.email_enabled:
            send_email(user.email, "Alert: Low Account Balance", msg_text)
        if prefs.sms_enabled and user.phone_number:
            send_sms(user.phone_number, msg_text)


@router.post("/api/v1/transfers/internal", response_model=InternalTransferResponse)
def internal_transfer(
    payload: InternalTransferRequest,
    idempotency_key: str | None = Depends(check_idempotency),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # If idempotency check returned a cached response, return it directly
    if idempotency_key and not isinstance(idempotency_key, str):
        return idempotency_key

    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be greater than zero",
        )

    if payload.source_account_id == payload.destination_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination accounts must be different",
        )

    source_acc = (
        db.query(Account)
        .filter(
            Account.id == payload.source_account_id, Account.user_id == current_user.id
        )
        .first()
    )
    dest_acc = (
        db.query(Account)
        .filter(
            Account.id == payload.destination_account_id,
            Account.user_id == current_user.id,
        )
        .first()
    )

    if not source_acc or not dest_acc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid source or destination account",
        )

    if float(source_acc.available_balance) < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds in source account",
        )

    # Enforce limits
    check_limits_and_update(db, current_user.id, payload.amount)

    # Perform transfer
    source_acc.balance = float(source_acc.balance) - payload.amount
    source_acc.available_balance = float(source_acc.available_balance) - payload.amount

    dest_acc.balance = float(dest_acc.balance) + payload.amount
    dest_acc.available_balance = float(dest_acc.available_balance) + payload.amount

    # Create transactions
    txn_out = Transaction(
        id=uuid.uuid4(),
        account_id=source_acc.id,
        type="transfer_out",
        amount=payload.amount,
        description=f"Internal transfer to account {dest_acc.account_number}",
        category="transfer",
        status="completed",
    )
    txn_in = Transaction(
        id=uuid.uuid4(),
        account_id=dest_acc.id,
        type="transfer_in",
        amount=payload.amount,
        description=f"Internal transfer from account {source_acc.account_number}",
        category="transfer",
        status="completed",
    )
    db.add_all([txn_out, txn_in])
    db.commit()

    # Trigger alerts
    check_and_trigger_alerts(
        db, current_user, source_acc, payload.amount, "transfer_out"
    )
    check_and_trigger_alerts(db, current_user, dest_acc, payload.amount, "transfer_in")

    log_event(
        event_type="INTERNAL_TRANSFER",
        user_id=str(current_user.id),
        username=current_user.username,
        details={
            "source_account": source_acc.account_number,
            "destination_account": dest_acc.account_number,
            "amount": payload.amount,
        },
        severity="INFO",
    )

    response = InternalTransferResponse(
        id=txn_out.id,
        status="completed",
        amount=payload.amount,
        created_at=txn_out.created_at,
    )

    if idempotency_key:
        save_idempotency_response(idempotency_key, response.dict())

    return response


@router.post("/api/v1/transfers/external", response_model=ExternalTransferResponse)
def external_transfer(
    payload: ExternalTransferRequest,
    idempotency_key: str | None = Depends(check_idempotency),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if idempotency_key and not isinstance(idempotency_key, str):
        return idempotency_key

    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be greater than zero",
        )

    source_acc = (
        db.query(Account)
        .filter(
            Account.id == payload.source_account_id, Account.user_id == current_user.id
        )
        .first()
    )
    payee = (
        db.query(Payee)
        .filter(
            Payee.id == payload.destination_payee_id, Payee.user_id == current_user.id
        )
        .first()
    )

    if not source_acc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid source account",
        )

    if not payee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payee",
        )

    if payee.status != "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payee must be verified before initiating external transfers",
        )

    if float(source_acc.available_balance) < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient funds in source account",
        )

    # Enforce limits
    check_limits_and_update(db, current_user.id, payload.amount)

    # Step-up authentication check
    if payload.amount >= settings.STEP_UP_THRESHOLD_AMOUNT:
        if not payload.step_up_session_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Step-up authentication required for large transfers",
            )
        # Verify step-up session
        step_up_session = verified_step_up_sessions.get(str(payload.step_up_session_id))
        if (
            not step_up_session
            or step_up_session["user_id"] != str(current_user.id)
            or step_up_session["action_type"] != "large_transfer"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired step-up authentication session",
            )

    # Perform transfer
    source_acc.balance = float(source_acc.balance) - payload.amount
    source_acc.available_balance = float(source_acc.available_balance) - payload.amount

    # Create transaction
    txn = Transaction(
        id=uuid.uuid4(),
        account_id=source_acc.id,
        type="transfer_out",
        amount=payload.amount,
        description=f"External ACH transfer to {payee.name}",
        category="transfer",
        payee_id=payee.id,
        status="completed",
    )
    db.add(txn)
    db.commit()

    # Trigger alerts
    check_and_trigger_alerts(
        db, current_user, source_acc, payload.amount, "transfer_out"
    )

    # Dispatch webhook if high-risk transfer
    if payload.amount >= settings.STEP_UP_THRESHOLD_AMOUNT:
        from server.routers.webhooks import dispatch_webhook

        dispatch_webhook(
            user_id=current_user.id,
            event_type="high_risk_transfer",
            payload={
                "transaction_id": str(txn.id),
                "amount": payload.amount,
                "source_account": source_acc.account_number,
                "payee_name": payee.name,
            },
            db=db,
        )

    log_event(
        event_type="EXTERNAL_TRANSFER",
        user_id=str(current_user.id),
        username=current_user.username,
        details={
            "source_account": source_acc.account_number,
            "payee_name": payee.name,
            "amount": payload.amount,
        },
        severity="INFO",
    )

    response = ExternalTransferResponse(
        id=txn.id,
        status="completed",
        amount=payload.amount,
        created_at=txn.created_at,
    )

    if idempotency_key:
        save_idempotency_response(idempotency_key, response.dict())

    return response


@router.get("/api/v1/payees", response_model=list[PayeeResponse])
def list_payees(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    payees = db.query(Payee).filter(Payee.user_id == current_user.id).all()
    return payees


@router.post("/api/v1/payees", response_model=PayeeResponse)
def add_payee(
    payload: PayeeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Step-up authentication check
    if not payload.step_up_session_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Step-up authentication required to add a payee",
        )

    step_up_session = verified_step_up_sessions.get(str(payload.step_up_session_id))
    if (
        not step_up_session
        or step_up_session["user_id"] != str(current_user.id)
        or step_up_session["action_type"] != "add_payee"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired step-up authentication session",
        )

    # Generate verification code
    verification_code = f"{random.randint(100000, 999999)}"

    payee = Payee(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=payload.name,
        account_number=payload.account_number,
        routing_number=payload.routing_number,
        status="pending_verification",
        verification_code=verification_code,
    )
    db.add(payee)
    db.commit()

    # Dispatch webhook
    from server.routers.webhooks import dispatch_webhook

    dispatch_webhook(
        user_id=current_user.id,
        event_type="payee_added",
        payload={
            "payee_id": str(payee.id),
            "name": payee.name,
            "status": payee.status,
        },
        db=db,
    )

    log_event(
        event_type="ADD_PAYEE",
        user_id=str(current_user.id),
        username=current_user.username,
        details={"payee_name": payload.name, "payee_id": str(payee.id)},
        severity="INFO",
    )

    return payee


@router.post("/api/v1/payees/{id}/verify", response_model=PayeeResponse)
def verify_payee(
    id: UUID,
    payload: PayeeVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payee = (
        db.query(Payee).filter(Payee.id == id, Payee.user_id == current_user.id).first()
    )
    if not payee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payee not found"
        )

    if payee.status == "verified":
        return payee

    # Support bypass code 000000 in dev mode
    is_valid = payee.verification_code == payload.verification_code
    if settings.DEV_MODE and payload.verification_code == settings.DEV_MFA_BYPASS_CODE:
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )

    payee.status = "verified"
    payee.verification_code = None
    db.commit()

    log_event(
        event_type="VERIFY_PAYEE",
        user_id=str(current_user.id),
        username=current_user.username,
        details={"payee_name": payee.name, "payee_id": str(payee.id)},
        severity="INFO",
    )

    return payee


@router.get("/api/v1/limits", response_model=LimitsResponse)
def get_limits(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Calculate daily remaining
    daily_limit = 10000.0
    per_txn_limit = 5000.0

    now = datetime.datetime.now(datetime.timezone.utc)
    start_of_day = datetime.datetime(
        now.year, now.month, now.day, tzinfo=datetime.timezone.utc
    )

    user_accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    account_ids = [acc.id for acc in user_accounts]

    today_txns = (
        db.query(Transaction)
        .filter(
            Transaction.account_id.in_(account_ids),
            Transaction.created_at >= start_of_day,
            Transaction.type.in_(["transfer_out", "payment"]),
            Transaction.status == "completed",
        )
        .all()
    )

    today_total = sum(float(t.amount) for t in today_txns)
    daily_remaining = max(0.0, daily_limit - today_total)

    return LimitsResponse(
        daily_limit=daily_limit,
        daily_remaining=daily_remaining,
        per_transaction_limit=per_txn_limit,
    )


@router.get("/api/v1/alerts/preferences", response_model=AlertPreferencesResponse)
def get_alert_preferences(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    prefs = (
        db.query(AlertPreference)
        .filter(AlertPreference.user_id == current_user.id)
        .first()
    )
    if not prefs:
        prefs = AlertPreference(
            id=uuid.uuid4(),
            user_id=current_user.id,
            push_enabled=True,
            sms_enabled=True,
            email_enabled=True,
            low_balance_threshold=100.00,
            large_transaction_threshold=1000.00,
        )
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs


@router.put("/api/v1/alerts/preferences")
def update_alert_preferences(
    payload: AlertPreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = (
        db.query(AlertPreference)
        .filter(AlertPreference.user_id == current_user.id)
        .first()
    )
    if not prefs:
        prefs = AlertPreference(
            id=uuid.uuid4(),
            user_id=current_user.id,
        )
        db.add(prefs)

    prefs.push_enabled = payload.push_enabled
    prefs.sms_enabled = payload.sms_enabled
    prefs.email_enabled = payload.email_enabled
    prefs.low_balance_threshold = payload.low_balance_threshold
    prefs.large_transaction_threshold = payload.large_transaction_threshold
    db.commit()

    log_event(
        event_type="UPDATE_ALERT_PREFERENCES",
        user_id=str(current_user.id),
        username=current_user.username,
        severity="INFO",
    )

    return {"message": "Alert preferences updated successfully"}


# Secure Messaging Endpoints
@router.get("/api/v1/messages", response_model=list[MessageResponse])
def list_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(Message.user_id == current_user.id)
        .order_by(Message.created_at.desc())
        .all()
    )
    return messages


@router.get("/api/v1/messages/{id}", response_model=MessageResponse)
def get_message(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(Message)
        .filter(Message.id == id, Message.user_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    return msg


@router.post("/api/v1/messages", response_model=MessageResponse)
def send_message(
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = current_user.id
    sender_name = "User"

    if payload.recipient_username:
        recipient = (
            db.query(User).filter(User.username == payload.recipient_username).first()
        )
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found",
            )
        target_user_id = recipient.id
        sender_name = current_user.username

    msg = Message(
        id=uuid.uuid4(),
        user_id=target_user_id,
        sender=sender_name,
        subject=payload.subject,
        body=payload.body,
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.put("/api/v1/messages/{id}", response_model=MessageResponse)
def mark_message_as_read(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(Message)
        .filter(Message.id == id, Message.user_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


# Alert History Endpoint
@router.get("/api/v1/alerts", response_model=list[AlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )
    return alerts


# Profile Endpoints
pending_contact_changes = {}


@router.get("/api/v1/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/api/v1/profile/contact/change-request")
def contact_change_request(
    payload: ContactChangeRequest,
    current_user: User = Depends(get_current_user),
):
    code = f"{random.randint(100000, 999999)}"
    pending_contact_changes[str(current_user.id)] = {
        "email": payload.email,
        "phone_number": payload.phone_number,
        "code": code,
    }

    from server.utils.notifications import send_email, send_sms

    send_email(
        payload.email,
        "ApexSecure Bank: Contact Information Change Request",
        f"Your verification code to update contact information is {code}.",
    )
    if payload.phone_number:
        send_sms(
            payload.phone_number,
            f"Your ApexSecure Bank contact change verification code is {code}.",
        )

    return {"message": "Verification code sent to your new contact methods"}


@router.post("/api/v1/profile/contact/verify")
def contact_change_verify(
    payload: ContactVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    change = pending_contact_changes.get(str(current_user.id))
    if not change:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending contact change request found",
        )

    is_valid = change["code"] == payload.code
    if settings.DEV_MODE and payload.code == settings.DEV_MFA_BYPASS_CODE:
        is_valid = True

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )

    user = db.query(User).filter(User.id == current_user.id).first()
    user.email = change["email"]
    user.phone_number = change["phone_number"]
    db.commit()

    from server.routers.webhooks import dispatch_webhook

    dispatch_webhook(
        user_id=current_user.id,
        event_type="contact_info_updated",
        payload={
            "email": user.email,
            "phone_number": user.phone_number,
        },
        db=db,
    )

    pending_contact_changes.pop(str(current_user.id), None)

    return {"message": "Contact information updated successfully"}
