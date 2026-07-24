import datetime
import random
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from server.config import settings
from server.database import get_db
from server.models.lockout import LockoutState
from server.models.session import UserSession
from server.models.user import User
from server.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    MfaResendRequest,
    MfaResendResponse,
    MfaVerifyRequest,
    RefreshRequest,
    StepUpRequest,
    StepUpResponse,
    TokenResponse,
    UserResponse,
)
from server.utils.audit import log_event
from server.utils.notifications import (
    notify_lockout,
    notify_new_session,
    send_email,
    send_sms,
)
from server.utils.security import (
    create_access_token,
    decode_token,
    verify_password,
    verify_totp,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# In-memory IP rate limiting
# Key: IP address, Value: list of datetime timestamps of login attempts
ip_attempts = {}

# Global failed login attempts to defend against distributed credential stuffing
global_failed_attempts = []


def check_ip_rate_limit(ip_address: str):
    now = datetime.datetime.now(datetime.timezone.utc)
    ten_minutes_ago = now - datetime.timedelta(
        minutes=settings.IP_THROTTLE_WINDOW_MINUTES
    )

    if ip_address not in ip_attempts:
        ip_attempts[ip_address] = []

    # Filter out attempts older than 10 minutes
    ip_attempts[ip_address] = [
        t for t in ip_attempts[ip_address] if t > ten_minutes_ago
    ]

    attempts_count = len(ip_attempts[ip_address])

    if attempts_count >= settings.IP_THROTTLE_THRESHOLD:
        log_event(
            event_type="IP_BLOCKED",
            source_ip=ip_address,
            reason=f"IP rate limit exceeded: {attempts_count} attempts in 10 minutes",
            severity="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts from this IP. Please try again later.",
        )

    # Record this attempt
    ip_attempts[ip_address].append(now)


def check_global_failed_attempts():
    global global_failed_attempts
    now = datetime.datetime.now(datetime.timezone.utc)
    ten_minutes_ago = now - datetime.timedelta(minutes=10)

    # Filter out attempts older than 10 minutes
    global_failed_attempts = [t for t in global_failed_attempts if t > ten_minutes_ago]

    # If global failed attempts exceed 100 in 10 minutes, trigger global throttling
    if len(global_failed_attempts) >= 100:
        log_event(
            event_type="GLOBAL_THROTTLE_TRIGGERED",
            reason="Global failed login threshold exceeded (credential stuffing defense)",
            severity="CRITICAL",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="System is experiencing high load. Please try again later.",
        )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else "127.0.0.1"
    check_ip_rate_limit(ip_address)
    check_global_failed_attempts()

    user = (
        db.query(User)
        .filter((User.username == payload.username) | (User.email == payload.username))
        .first()
    )

    if not user:
        global_failed_attempts.append(datetime.datetime.now(datetime.timezone.utc))
        log_event(
            event_type="LOGIN_FAILURE",
            username=payload.username,
            source_ip=ip_address,
            user_agent=request.headers.get("user-agent"),
            channel=payload.channel,
            reason="User not found",
            severity="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    lockout = db.query(LockoutState).filter(LockoutState.user_id == user.id).first()
    if not lockout:
        lockout = LockoutState(
            id=uuid.uuid4(),
            user_id=user.id,
            failed_attempts=0,
            login_flow_restarts=0,
            otp_resends=0,
            otp_failures=0,
        )
        db.add(lockout)
        db.commit()
        db.refresh(lockout)

    now = datetime.datetime.now(datetime.timezone.utc)

    # Check if account is locked
    if user.is_locked:
        if user.locked_until and now < user.locked_until.replace(
            tzinfo=datetime.timezone.utc
        ):
            log_event(
                event_type="LOGIN_FAILURE",
                user_id=str(user.id),
                username=user.username,
                source_ip=ip_address,
                user_agent=request.headers.get("user-agent"),
                channel=payload.channel,
                reason="Account is locked",
                severity="WARNING",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is temporarily locked. Please try again later.",
            )
        else:
            # Lockout expired, unlock
            user.is_locked = False
            user.locked_until = None
            lockout.failed_attempts = 0
            lockout.otp_failures = 0
            lockout.login_flow_restarts = 0
            db.commit()

    # Verify password
    if not verify_password(payload.password, user.hashed_password):
        global_failed_attempts.append(now)
        lockout.failed_attempts += 1
        lockout.last_failed_at = now

        if lockout.failed_attempts >= settings.MAX_FAILED_ATTEMPTS:
            user.is_locked = True
            user.locked_until = now + datetime.timedelta(
                minutes=settings.LOCKOUT_DURATION_MINUTES
            )
            db.commit()
            notify_lockout(user.email, user.phone_number, user.username)
            log_event(
                event_type="ACCOUNT_LOCKOUT",
                user_id=str(user.id),
                username=user.username,
                source_ip=ip_address,
                user_agent=request.headers.get("user-agent"),
                channel=payload.channel,
                reason="Max failed password attempts reached",
                severity="WARNING",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is temporarily locked due to too many failed attempts.",
            )

        db.commit()
        log_event(
            event_type="LOGIN_FAILURE",
            user_id=str(user.id),
            username=user.username,
            source_ip=ip_address,
            user_agent=request.headers.get("user-agent"),
            channel=payload.channel,
            reason="Invalid password",
            severity="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    # Password is correct. Check login-flow restarts
    # "Login-flow restarts: capped at 3 per account per rolling 15-minute window before triggering full lockout."
    if lockout.last_restart_at:
        restart_window = now - datetime.timedelta(
            minutes=settings.FLOW_RESTART_WINDOW_MINUTES
        )
        if (
            lockout.last_restart_at.replace(tzinfo=datetime.timezone.utc)
            > restart_window
        ):
            lockout.login_flow_restarts += 1
        else:
            lockout.login_flow_restarts = 1
    else:
        lockout.login_flow_restarts = 1

    lockout.last_restart_at = now

    if lockout.login_flow_restarts > settings.MAX_FLOW_RESTARTS:
        user.is_locked = True
        user.locked_until = now + datetime.timedelta(
            minutes=settings.LOCKOUT_DURATION_MINUTES
        )
        db.commit()
        notify_lockout(user.email, user.phone_number, user.username)
        log_event(
            event_type="ACCOUNT_LOCKOUT",
            user_id=str(user.id),
            username=user.username,
            source_ip=ip_address,
            user_agent=request.headers.get("user-agent"),
            channel=payload.channel,
            reason="Max login flow restarts exceeded",
            severity="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is temporarily locked due to too many login flow restarts.",
        )

    # Generate MFA session
    mfa_session_id = uuid.uuid4()
    otp_code = f"{random.randint(100000, 999999)}"

    lockout.otp_code = otp_code
    lockout.otp_expires_at = now + datetime.timedelta(
        minutes=settings.MFA_OTP_EXPIRE_MINUTES
    )
    lockout.otp_resends = 0
    lockout.otp_failures = 0
    lockout.id = (
        mfa_session_id  # Reuse lockout state ID as mfa_session_id for simplicity
    )
    db.commit()

    # Send OTP
    send_email(
        user.email,
        "Your MFA Verification Code",
        f"Your verification code is {otp_code}. It expires in 5 minutes.",
    )
    if user.phone_number:
        send_sms(
            user.phone_number, f"Your ApexSecure Bank verification code is {otp_code}."
        )

    log_event(
        event_type="MFA_CHALLENGE",
        user_id=str(user.id),
        username=user.username,
        source_ip=ip_address,
        user_agent=request.headers.get("user-agent"),
        channel=payload.channel,
        severity="INFO",
    )

    mfa_methods = ["email"]
    if user.phone_number:
        mfa_methods.append("sms")
    if user.totp_secret:
        mfa_methods.append("totp")

    return LoginResponse(
        message="MFA verification required",
        mfa_methods=mfa_methods,
        mfa_session_id=mfa_session_id,
    )


@router.post("/mfa/verify", response_model=TokenResponse)
def mfa_verify(
    payload: MfaVerifyRequest, request: Request, db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else "127.0.0.1"

    lockout = (
        db.query(LockoutState).filter(LockoutState.id == payload.mfa_session_id).first()
    )
    if not lockout:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA session",
        )

    user = db.query(User).filter(User.id == lockout.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    now = datetime.datetime.now(datetime.timezone.utc)

    # Check if account is locked
    if user.is_locked:
        if user.locked_until and now < user.locked_until.replace(
            tzinfo=datetime.timezone.utc
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is temporarily locked. Please try again later.",
            )
        else:
            user.is_locked = False
            user.locked_until = None
            lockout.failed_attempts = 0
            lockout.otp_failures = 0
            db.commit()

    # Verify OTP code
    is_valid = False
    if settings.DEV_MODE and payload.code == settings.DEV_MFA_BYPASS_CODE:
        is_valid = True
    elif payload.method == "totp":
        if user.totp_secret:
            is_valid = verify_totp(user.totp_secret, payload.code)
    elif payload.method in ["sms", "email"]:
        if lockout.otp_code and lockout.otp_expires_at:
            if now < lockout.otp_expires_at.replace(tzinfo=datetime.timezone.utc):
                is_valid = lockout.otp_code == payload.code

    if not is_valid:
        lockout.otp_failures += 1
        lockout.failed_attempts += 1
        db.commit()

        if lockout.failed_attempts >= settings.MAX_FAILED_ATTEMPTS:
            user.is_locked = True
            user.locked_until = now + datetime.timedelta(
                minutes=settings.LOCKOUT_DURATION_MINUTES
            )
            db.commit()
            notify_lockout(user.email, user.phone_number, user.username)
            log_event(
                event_type="ACCOUNT_LOCKOUT",
                user_id=str(user.id),
                username=user.username,
                source_ip=ip_address,
                user_agent=request.headers.get("user-agent"),
                reason="Max failed OTP attempts reached",
                severity="WARNING",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is temporarily locked due to too many failed attempts.",
            )

        log_event(
            event_type="MFA_FAILURE",
            user_id=str(user.id),
            username=user.username,
            source_ip=ip_address,
            user_agent=request.headers.get("user-agent"),
            reason=f"Invalid MFA code for method {payload.method}",
            severity="WARNING",
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    # MFA is successful! Reset lockout state
    lockout.failed_attempts = 0
    lockout.otp_failures = 0
    lockout.login_flow_restarts = 0
    lockout.otp_resends = 0
    lockout.otp_code = None
    lockout.otp_expires_at = None

    # Check for suspicious new-session activity
    # "distinguishing between concurrent legitimate multi-device use and suspicious new-session activity"
    active_sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.is_active == True)
        .all()
    )

    device_info = request.headers.get("user-agent", "Unknown Device")
    is_suspicious = False
    if active_sessions:
        # If there are active sessions, check if the new session is from a different IP or device
        different_ip = any(s.ip_address != ip_address for s in active_sessions)
        different_device = any(s.device_info != device_info for s in active_sessions)
        if different_ip or different_device:
            is_suspicious = True
            log_event(
                event_type="SUSPICIOUS_NEW_SESSION",
                user_id=str(user.id),
                username=user.username,
                source_ip=ip_address,
                user_agent=device_info,
                reason="New session from different IP or device than existing active sessions",
                severity="WARNING",
            )
            # Send high-priority alert
            send_email(
                user.email,
                "HIGH PRIORITY: Suspicious Login Detected",
                f"Hello {user.username}, we detected a new login to your account from a new device or location: {device_info} ({ip_address}). If this wasn't you, please secure your account immediately.",
            )
            if user.phone_number:
                send_sms(
                    user.phone_number,
                    f"HIGH PRIORITY: Suspicious login to your ApexSecure Bank account from {ip_address}.",
                )

    # Create new session
    session_id = uuid.uuid4()
    refresh_token = f"ref_{uuid.uuid4()}_{uuid.uuid4()}"

    user_session = UserSession(
        id=session_id,
        user_id=user.id,
        refresh_token=refresh_token,
        channel="web",  # Default to web, can be customized
        device_info=device_info,
        ip_address=ip_address,
        location="Unknown Location",
        is_active=True,
        expires_at=now + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        last_active_at=now,
    )
    db.add(user_session)
    db.commit()

    # Generate access token
    access_token = create_access_token(
        {"sub": str(user.id), "session_id": str(session_id), "username": user.username}
    )

    if not is_suspicious:
        notify_new_session(
            user.email,
            user.phone_number,
            user.username,
            user_session.device_info,
            ip_address,
        )

    log_event(
        event_type="LOGIN_SUCCESS",
        user_id=str(user.id),
        username=user.username,
        source_ip=ip_address,
        user_agent=device_info,
        channel="web",
        severity="INFO",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user),
    )


@router.post("/mfa/resend", response_model=MfaResendResponse)
def mfa_resend(
    payload: MfaResendRequest, request: Request, db: Session = Depends(get_db)
):
    lockout = (
        db.query(LockoutState).filter(LockoutState.id == payload.mfa_session_id).first()
    )
    if not lockout:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA session",
        )

    user = db.query(User).filter(User.id == lockout.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    now = datetime.datetime.now(datetime.timezone.utc)

    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is locked"
        )

    # Check cooldown (60 seconds)
    if lockout.last_otp_resend_at:
        cooldown_end = lockout.last_otp_resend_at.replace(
            tzinfo=datetime.timezone.utc
        ) + datetime.timedelta(seconds=settings.MFA_RESEND_COOLDOWN_SECONDS)
        if now < cooldown_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please wait before requesting a new code",
            )

    # Check resend cap (5 resends)
    if lockout.otp_resends >= settings.MFA_MAX_RESENDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum resend attempts exceeded for this login session",
        )

    # Generate new OTP
    otp_code = f"{random.randint(100000, 999999)}"
    lockout.otp_code = otp_code
    lockout.otp_expires_at = now + datetime.timedelta(
        minutes=settings.MFA_OTP_EXPIRE_MINUTES
    )
    lockout.otp_resends += 1
    lockout.last_otp_resend_at = now
    db.commit()

    # Send OTP
    if payload.method == "email":
        send_email(
            user.email,
            "Your MFA Verification Code",
            f"Your verification code is {otp_code}. It expires in 5 minutes.",
        )
    elif payload.method == "sms" and user.phone_number:
        send_sms(
            user.phone_number, f"Your ApexSecure Bank verification code is {otp_code}."
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA method or phone number not on file",
        )

    log_event(
        event_type="MFA_RESEND",
        user_id=str(user.id),
        username=user.username,
        details={"method": payload.method},
        severity="INFO",
    )

    return MfaResendResponse(
        cooldown_seconds=settings.MFA_RESEND_COOLDOWN_SECONDS,
        message="Verification code resent successfully",
        remaining_attempts=settings.MFA_MAX_RESENDS - lockout.otp_resends,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    session = (
        db.query(UserSession)
        .filter(
            UserSession.refresh_token == payload.refresh_token,
            UserSession.is_active == True,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    now = datetime.datetime.now(datetime.timezone.utc)
    if now > session.expires_at.replace(tzinfo=datetime.timezone.utc):
        session.is_active = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired"
        )

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account locked",
        )

    # Generate new access token and refresh token
    new_refresh_token = f"ref_{uuid.uuid4()}_{uuid.uuid4()}"
    session.refresh_token = new_refresh_token
    session.last_active_at = now
    session.expires_at = now + datetime.timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    db.commit()

    access_token = create_access_token(
        {"sub": str(user.id), "session_id": str(session.id), "username": user.username}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.from_orm(user),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    session = (
        db.query(UserSession)
        .filter(UserSession.refresh_token == payload.refresh_token)
        .first()
    )
    if session:
        session.is_active = False
        db.commit()

        user = db.query(User).filter(User.id == session.user_id).first()
        username = user.username if user else "Unknown"
        log_event(
            event_type="LOGOUT",
            user_id=str(session.user_id),
            username=username,
            severity="INFO",
        )

    return LogoutResponse(message="Successfully logged out")


# In-memory step-up challenges
# Key: step_up_session_id, Value: dict with user_id, action_type, code, expires_at
step_up_challenges = {}


@router.post("/step-up", response_model=StepUpResponse)
def step_up(payload: StepUpRequest, request: Request, db: Session = Depends(get_db)):
    # Get current user from authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized"
        )
    token = authorization.split(" ")[1]
    token_payload = decode_token(token)
    if not token_payload or token_payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    user_id = token_payload.get("sub")
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user or user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account locked",
        )

    now = datetime.datetime.now(datetime.timezone.utc)

    # If code is not provided, initiate step-up challenge
    if not payload.code:
        # Check if large transfer threshold is exceeded
        if payload.action_type == "large_transfer":
            amount = payload.amount or 0.0
            if amount < settings.STEP_UP_THRESHOLD_AMOUNT:
                return StepUpResponse(
                    message="Step-up authentication not required for this amount",
                    step_up_required=False,
                )

        step_up_session_id = uuid.uuid4()
        otp_code = f"{random.randint(100000, 999999)}"

        step_up_challenges[str(step_up_session_id)] = {
            "user_id": str(user.id),
            "action_type": payload.action_type,
            "code": otp_code,
            "expires_at": now + datetime.timedelta(minutes=5),
        }

        # Send OTP
        send_email(
            user.email,
            "Step-up Verification Code",
            f"Your step-up verification code is {otp_code}. It expires in 5 minutes.",
        )
        if user.phone_number:
            send_sms(
                user.phone_number,
                f"Your ApexSecure Bank step-up verification code is {otp_code}.",
            )

        log_event(
            event_type="STEP_UP_CHALLENGE",
            user_id=str(user.id),
            username=user.username,
            details={"action_type": payload.action_type},
            severity="INFO",
        )

        return StepUpResponse(
            message="Step-up authentication required",
            step_up_required=True,
            step_up_session_id=step_up_session_id,
        )

    # If code is provided, verify it
    else:
        # Find step-up challenge
        # We can verify either via step_up_challenges or TOTP directly
        is_valid = False

        if settings.DEV_MODE and payload.code == settings.DEV_MFA_BYPASS_CODE:
            is_valid = True
            matching_challenge_id = None
        # Try TOTP first if user has TOTP set up
        elif user.totp_secret:
            is_valid = verify_totp(user.totp_secret, payload.code)

        # If not TOTP, check step_up_challenges
        if not is_valid:
            # Find the challenge for this user and action_type
            matching_challenge_id = None
            for cid, challenge in list(step_up_challenges.items()):
                if (
                    challenge["user_id"] == str(user.id)
                    and challenge["action_type"] == payload.action_type
                ):
                    if now < challenge["expires_at"]:
                        if challenge["code"] == payload.code:
                            is_valid = True
                            matching_challenge_id = cid
                            break

            if matching_challenge_id:
                del step_up_challenges[matching_challenge_id]

        if not is_valid:
            log_event(
                event_type="STEP_UP_FAILURE",
                user_id=str(user.id),
                username=user.username,
                details={"action_type": payload.action_type},
                severity="WARNING",
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code",
            )

        verified_id = payload.step_up_session_id or (
            UUID(matching_challenge_id) if matching_challenge_id else uuid.uuid4()
        )
        from server.utils.security import verified_step_up_sessions

        verified_step_up_sessions[str(verified_id)] = {
            "user_id": str(user.id),
            "action_type": payload.action_type,
            "verified_at": now,
        }

        log_event(
            event_type="STEP_UP_SUCCESS",
            user_id=str(user.id),
            username=user.username,
            details={
                "action_type": payload.action_type,
                "step_up_session_id": str(verified_id),
            },
            severity="INFO",
        )

        return StepUpResponse(
            message="Step-up authentication successful",
            step_up_required=False,
            step_up_session_id=verified_id,
        )
