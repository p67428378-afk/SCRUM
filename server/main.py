import os
from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload

from server.database import get_db, init_db, seed_data
from server.models import (
    User,
    AttendanceEvent,
    AttendanceAdjustmentRequest,
    AttendanceAuditLog,
)
from server.schemas import (
    UserResponse,
    UserCreate,
    LoginRequest,
    Token,
    AttendanceEventResponse,
    AdjustmentRequestCreate,
    AdjustmentRequestResponse,
    AdjustmentRequestUpdate,
    AuditLogResponse,
)
from server.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
)

app = FastAPI(
    title="Attendance Management System API",
    version="1.0.0",
    description="API for recording check-ins/check-outs, viewing attendance records, and managing attendance status.",
)

# CORS Middleware
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Lifespan / Startup Event
@app.on_event("startup")
def on_startup():
    init_db()
    db = next(get_db())
    try:
        seed_data(db)
    finally:
        db.close()


# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Helper functions for timezone-naive UTC handling
def get_utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_naive_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# Dependencies
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(allowed_roles: List[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency


# --- AUTH ENDPOINTS ---


@app.post(
    "/api/v1/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered."
        )

    # Validate manager_id if provided
    if user_in.manager_id:
        manager = (
            db.query(User)
            .filter(User.id == user_in.manager_id, User.role == "Manager")
            .first()
        )
        if not manager:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid manager ID."
            )

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        manager_id=user_in.manager_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/v1/auth/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# --- ATTENDANCE ENDPOINTS ---


@app.post(
    "/api/v1/attendance/check-in",
    response_model=AttendanceEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def check_in(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Check if there is an active check-in session
    active_session = (
        db.query(AttendanceEvent)
        .filter(
            AttendanceEvent.user_id == current_user.id,
            AttendanceEvent.check_out_time == None,
        )
        .first()
    )

    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active check-in session already exists.",
        )

    now_utc = get_utc_now()

    # Determine status: Late if check-in is after 09:00 AM UTC
    cutoff_time = now_utc.replace(hour=9, minute=0, second=0, microsecond=0)
    status_val = "Present"
    if now_utc > cutoff_time:
        status_val = "Late"

    new_event = AttendanceEvent(
        user_id=current_user.id,
        check_in_time=now_utc,
        status=status_val,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event


@app.post("/api/v1/attendance/check-out", response_model=AttendanceEventResponse)
def check_out(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Find active check-in session
    active_session = (
        db.query(AttendanceEvent)
        .filter(
            AttendanceEvent.user_id == current_user.id,
            AttendanceEvent.check_out_time == None,
        )
        .first()
    )

    if not active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active check-in session found.",
        )

    now_utc = get_utc_now()
    active_session.check_out_time = now_utc

    # Calculate duration and update status if needed
    duration = now_utc - active_session.check_in_time
    duration_hours = duration.total_seconds() / 3600.0

    # If worked less than 4 hours, status is Half-Day
    if duration_hours < 4.0:
        active_session.status = "Half-Day"

    db.commit()
    db.refresh(active_session)
    return active_session


@app.get("/api/v1/attendance/history", response_model=List[AttendanceEventResponse])
def get_history(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AttendanceEvent).filter(AttendanceEvent.user_id == current_user.id)

    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(AttendanceEvent.check_in_time >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(AttendanceEvent.check_in_time <= end_dt)
    if status_filter:
        query = query.filter(AttendanceEvent.status == status_filter)

    # Order by check_in_time descending for stable ordering
    query = query.order_by(AttendanceEvent.check_in_time.desc())

    return query.offset(skip).limit(limit).all()


@app.get("/api/v1/attendance/team", response_model=List[AttendanceEventResponse])
def get_team_history(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(["Manager", "Admin"])),
    db: Session = Depends(get_db),
):
    # If Manager, get history of direct reports. If Admin, get all history.
    if current_user.role == "Admin":
        query = db.query(AttendanceEvent)
    else:
        # Get direct reports
        subordinate_ids = [
            u.id
            for u in db.query(User).filter(User.manager_id == current_user.id).all()
        ]
        query = db.query(AttendanceEvent).filter(
            AttendanceEvent.user_id.in_(subordinate_ids)
        )

    if start_date:
        start_dt = datetime.combine(start_date, datetime.min.time())
        query = query.filter(AttendanceEvent.check_in_time >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, datetime.max.time())
        query = query.filter(AttendanceEvent.check_in_time <= end_dt)
    if status_filter:
        query = query.filter(AttendanceEvent.status == status_filter)

    query = query.order_by(AttendanceEvent.check_in_time.desc())
    return query.offset(skip).limit(limit).all()


# --- APPROVALS ENDPOINTS ---


@app.post(
    "/api/v1/approvals/request",
    response_model=AdjustmentRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_adjustment_request(
    req_in: AdjustmentRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_request = AttendanceAdjustmentRequest(
        user_id=current_user.id,
        requested_check_in=to_naive_utc(req_in.requested_check_in),
        requested_check_out=to_naive_utc(req_in.requested_check_out),
        reason=req_in.reason,
        status="Pending",
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@app.get("/api/v1/approvals/requests", response_model=List[AdjustmentRequestResponse])
def list_adjustment_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(["Manager", "Admin"])),
    db: Session = Depends(get_db),
):
    # If Manager, list requests from direct reports. If Admin, list all.
    if current_user.role == "Admin":
        query = db.query(AttendanceAdjustmentRequest).options(
            joinedload(AttendanceAdjustmentRequest.user)
        )
    else:
        subordinate_ids = [
            u.id
            for u in db.query(User).filter(User.manager_id == current_user.id).all()
        ]
        query = (
            db.query(AttendanceAdjustmentRequest)
            .filter(AttendanceAdjustmentRequest.user_id.in_(subordinate_ids))
            .options(joinedload(AttendanceAdjustmentRequest.user))
        )

    if status_filter:
        query = query.filter(AttendanceAdjustmentRequest.status == status_filter)

    query = query.order_by(AttendanceAdjustmentRequest.created_at.desc())
    return query.offset(skip).limit(limit).all()


@app.put(
    "/api/v1/approvals/requests/{request_id}", response_model=AdjustmentRequestResponse
)
def update_adjustment_request(
    request_id: str,
    req_update: AdjustmentRequestUpdate,
    current_user: User = Depends(require_role(["Manager", "Admin"])),
    db: Session = Depends(get_db),
):
    request_obj = (
        db.query(AttendanceAdjustmentRequest)
        .filter(AttendanceAdjustmentRequest.id == request_id)
        .first()
    )
    if not request_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adjustment request not found.",
        )

    # If Manager, verify the request belongs to a direct report
    if current_user.role != "Admin":
        employee = db.query(User).filter(User.id == request_obj.user_id).first()
        if not employee or employee.manager_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to approve this request.",
            )

    if request_obj.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request has already been processed (Status: {request_obj.status}).",
        )

    request_obj.status = req_update.status
    request_obj.approver_id = current_user.id
    request_obj.updated_at = get_utc_now()

    if req_update.status == "Approved":
        # Create or update the corresponding AttendanceEvent
        # Let's find if there is an existing event on the requested check-in date
        check_in_date = request_obj.requested_check_in.date()
        start_of_day = datetime.combine(check_in_date, datetime.min.time())
        end_of_day = datetime.combine(check_in_date, datetime.max.time())

        event = (
            db.query(AttendanceEvent)
            .filter(
                AttendanceEvent.user_id == request_obj.user_id,
                AttendanceEvent.check_in_time >= start_of_day,
                AttendanceEvent.check_in_time <= end_of_day,
            )
            .first()
        )

        old_val = None
        if event:
            old_val = {
                "check_in_time": event.check_in_time.isoformat()
                if event.check_in_time
                else None,
                "check_out_time": event.check_out_time.isoformat()
                if event.check_out_time
                else None,
                "status": event.status,
            }
            event.check_in_time = request_obj.requested_check_in
            event.check_out_time = request_obj.requested_check_out

            # Recalculate status
            duration = (
                request_obj.requested_check_out - request_obj.requested_check_in
                if request_obj.requested_check_out
                else None
            )
            if duration:
                duration_hours = duration.total_seconds() / 3600.0
                if duration_hours < 4.0:
                    event.status = "Half-Day"
                else:
                    cutoff_time = request_obj.requested_check_in.replace(
                        hour=9, minute=0, second=0, microsecond=0
                    )
                    event.status = (
                        "Late"
                        if request_obj.requested_check_in > cutoff_time
                        else "Present"
                    )
            else:
                event.status = "Incomplete"
        else:
            # Create new event
            status_val = "Present"
            duration = (
                request_obj.requested_check_out - request_obj.requested_check_in
                if request_obj.requested_check_out
                else None
            )
            if duration:
                duration_hours = duration.total_seconds() / 3600.0
                if duration_hours < 4.0:
                    status_val = "Half-Day"
                else:
                    cutoff_time = request_obj.requested_check_in.replace(
                        hour=9, minute=0, second=0, microsecond=0
                    )
                    status_val = (
                        "Late"
                        if request_obj.requested_check_in > cutoff_time
                        else "Present"
                    )
            else:
                status_val = "Incomplete"

            event = AttendanceEvent(
                user_id=request_obj.user_id,
                check_in_time=request_obj.requested_check_in,
                check_out_time=request_obj.requested_check_out,
                status=status_val,
            )
            db.add(event)
            db.flush()  # Get event ID

        # Create Audit Log
        new_val = {
            "check_in_time": event.check_in_time.isoformat()
            if event.check_in_time
            else None,
            "check_out_time": event.check_out_time.isoformat()
            if event.check_out_time
            else None,
            "status": event.status,
        }

        audit_log = AttendanceAuditLog(
            editor_id=current_user.id,
            event_id=event.id,
            old_value=old_val,
            new_value=new_val,
            reason=f"Approved manual request: {request_obj.reason}",
        )
        db.add(audit_log)

    db.commit()
    db.refresh(request_obj)
    return request_obj


# --- ADMIN ENDPOINTS ---


@app.put(
    "/api/v1/admin/attendance/{attendance_id}", response_model=AttendanceEventResponse
)
def admin_adjust_attendance(
    attendance_id: str,
    requested_check_in: datetime,
    requested_check_out: Optional[datetime],
    reason: str,
    current_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    event = (
        db.query(AttendanceEvent).filter(AttendanceEvent.id == attendance_id).first()
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found."
        )

    old_val = {
        "check_in_time": event.check_in_time.isoformat()
        if event.check_in_time
        else None,
        "check_out_time": event.check_out_time.isoformat()
        if event.check_out_time
        else None,
        "status": event.status,
    }

    event.check_in_time = to_naive_utc(requested_check_in)
    event.check_out_time = to_naive_utc(requested_check_out)

    # Recalculate status
    if requested_check_out:
        duration = requested_check_out - requested_check_in
        duration_hours = duration.total_seconds() / 3600.0
        if duration_hours < 4.0:
            event.status = "Half-Day"
        else:
            cutoff_time = requested_check_in.replace(
                hour=9, minute=0, second=0, microsecond=0
            )
            event.status = "Late" if requested_check_in > cutoff_time else "Present"
    else:
        event.status = "Incomplete"

    new_val = {
        "check_in_time": event.check_in_time.isoformat()
        if event.check_in_time
        else None,
        "check_out_time": event.check_out_time.isoformat()
        if event.check_out_time
        else None,
        "status": event.status,
    }

    # Create Audit Log
    audit_log = AttendanceAuditLog(
        editor_id=current_user.id,
        event_id=event.id,
        old_value=old_val,
        new_value=new_val,
        reason=reason,
    )
    db.add(audit_log)
    db.commit()
    db.refresh(event)
    return event


@app.get("/api/v1/admin/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(AttendanceAuditLog).order_by(AttendanceAuditLog.created_at.desc())
    return query.offset(skip).limit(limit).all()
