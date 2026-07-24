from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid

from server.database import get_db
from server.models import User, MFACode, AuditLog
from server.schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    VerifyMFARequest,
    VerifyMFAResponse,
    UserSessionInfo,
    LogoutResponse,
    RefreshRequest,
    RefreshResponse,
    RecoverInitiateRequest,
    RecoverInitiateResponse,
    RecoverCompleteRequest,
    RecoverCompleteResponse,
    SessionResponse,
)
from server.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from server.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def log_audit_event(
    db: Session,
    event_type: str,
    user_id: str | None,
    request: Request,
    details: dict | None = None,
):
    source_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    audit_log = AuditLog(
        id=str(uuid.uuid4()),
        event_type=event_type,
        user_id=user_id,
        source_ip=source_ip,
        user_agent=user_agent,
        details=details,
    )
    db.add(audit_log)
    try:
        db.commit()
    except Exception:
        db.rollback()


@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == payload.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists"
        )

    # Mock core banking verification
    # If account_number or ssn is "invalid", return 404
    if payload.account_number.lower() == "invalid" or payload.ssn.lower() == "invalid":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account number or SSN not found in core banking",
        )

    # Create user
    hashed_pw = get_password_hash(payload.password)
    user_id = str(uuid.uuid4())
    customer_id = f"CUST-{random.randint(10000, 99999)}"

    security_answer_hash = None
    if payload.security_answer:
        security_answer_hash = get_password_hash(
            payload.security_answer.lower().strip()
        )

    user = User(
        id=user_id,
        username=payload.username,
        hashed_password=hashed_pw,
        customer_id=customer_id,
        is_active=True,
        failed_login_attempts=0,
        security_question=payload.security_question,
        security_answer_hash=security_answer_hash,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}",
        )

    log_audit_event(
        db, "USER_REGISTRATION", user_id, request, {"username": payload.username}
    )

    return RegisterResponse(message="User registered successfully", user_id=user_id)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        log_audit_event(
            db,
            "LOGIN_FAILURE_UNKNOWN_USER",
            None,
            request,
            {"username": payload.username},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # Check if account is locked temporarily
    if user.locked_until and user.locked_until > datetime.utcnow():
        log_audit_event(
            db, "LOGIN_FAILURE_LOCKED", user.id, request, {"username": payload.username}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked due to too many failed attempts",
        )
    elif user.locked_until and user.locked_until <= datetime.utcnow():
        # Lock expired, reset attempts
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()

    # Check if account is locked by failed attempts count
    if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        log_audit_event(
            db, "LOGIN_FAILURE_LOCKED", user.id, request, {"username": payload.username}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked due to too many failed attempts",
        )

    # Verify password
    if not verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        db.commit()
        log_audit_event(
            db,
            "LOGIN_FAILURE_WRONG_PASSWORD",
            user.id,
            request,
            {
                "username": payload.username,
                "failed_attempts": user.failed_login_attempts,
            },
        )
        if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account locked due to too many failed attempts",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    # Generate 6-digit MFA code
    mfa_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=settings.MFA_CODE_EXPIRE_MINUTES)

    mfa_entry = MFACode(
        id=str(uuid.uuid4()),
        user_id=user.id,
        code=mfa_code,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(mfa_entry)
    db.commit()

    log_audit_event(
        db,
        "LOGIN_MFA_TRIGGERED",
        user.id,
        request,
        {"username": payload.username, "mfa_code_for_testing": mfa_code},
    )

    return LoginResponse(
        message="MFA code sent successfully", mfa_required=True, user_id=user.id
    )


@router.post("/verify-mfa", response_model=VerifyMFAResponse)
def verify_mfa(
    payload: VerifyMFARequest, request: Request, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Find latest unused, unexpired MFA code
    mfa_entry = (
        db.query(MFACode)
        .filter(
            MFACode.user_id == user.id,
            MFACode.is_used == False,
            MFACode.expires_at > datetime.utcnow(),
        )
        .order_by(MFACode.created_at.desc())
        .first()
    )

    if not mfa_entry or mfa_entry.code != payload.code:
        log_audit_event(
            db,
            "MFA_VERIFICATION_FAILURE",
            user.id,
            request,
            {"code_entered": payload.code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired MFA code",
        )

    # Mark code as used
    mfa_entry.is_used = True
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.utcnow()
    db.commit()

    # Generate tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    log_audit_event(db, "LOGIN_SUCCESS", user.id, request, {"username": user.username})

    return VerifyMFAResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserSessionInfo(
            customer_id=user.customer_id, id=user.id, username=user.username
        ),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log_audit_event(
        db, "LOGOUT", current_user.id, request, {"username": current_user.username}
    )
    return LogoutResponse(message="Successfully logged out")


@router.post("/refresh", response_model=RefreshResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_token(payload.refresh_token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = token_payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    access_token = create_access_token({"sub": user.id})
    return RefreshResponse(access_token=access_token, token_type="bearer")


@router.post("/recover/initiate", response_model=RecoverInitiateResponse)
def recover_initiate(
    payload: RecoverInitiateRequest, request: Request, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Username not found"
        )

    # Verify security answer if configured
    if user.security_question and user.security_answer_hash:
        if not payload.security_answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Security answer required. Question: {user.security_question}",
            )
        normalized_answer = payload.security_answer.lower().strip()
        if not verify_password(normalized_answer, user.security_answer_hash):
            log_audit_event(
                db,
                "PASSWORD_RECOVERY_WRONG_ANSWER",
                user.id,
                request,
                {"username": user.username},
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid security answer",
            )

    # Generate recovery code
    recovery_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=settings.MFA_CODE_EXPIRE_MINUTES)

    mfa_entry = MFACode(
        id=str(uuid.uuid4()),
        user_id=user.id,
        code=recovery_code,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(mfa_entry)
    db.commit()

    log_audit_event(
        db,
        "PASSWORD_RECOVERY_INITIATED",
        user.id,
        request,
        {"username": user.username, "recovery_code_for_testing": recovery_code},
    )

    return RecoverInitiateResponse(
        message="Recovery code sent successfully", username=user.username
    )


@router.post("/recover/complete", response_model=RecoverCompleteResponse)
def recover_complete(
    payload: RecoverCompleteRequest, request: Request, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recovery code or password complexity not met",
        )

    # Find latest unused, unexpired recovery code
    mfa_entry = (
        db.query(MFACode)
        .filter(
            MFACode.user_id == user.id,
            MFACode.is_used == False,
            MFACode.expires_at > datetime.utcnow(),
        )
        .order_by(MFACode.created_at.desc())
        .first()
    )

    if not mfa_entry or mfa_entry.code != payload.email_code:
        log_audit_event(
            db,
            "PASSWORD_RECOVERY_FAILURE",
            user.id,
            request,
            {"code_entered": payload.email_code},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recovery code or password complexity not met",
        )

    # Mark code as used
    mfa_entry.is_used = True
    user.hashed_password = get_password_hash(payload.new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    log_audit_event(
        db, "PASSWORD_RECOVERY_SUCCESS", user.id, request, {"username": user.username}
    )

    return RecoverCompleteResponse(message="Password reset successfully")


@router.get("/session", response_model=SessionResponse)
def get_session(current_user: User = Depends(get_current_user)):
    return SessionResponse(
        customer_id=current_user.customer_id,
        id=current_user.id,
        last_login_at=current_user.last_login_at.isoformat()
        if current_user.last_login_at
        else None,
        username=current_user.username,
    )
