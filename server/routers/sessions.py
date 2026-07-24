import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.session import UserSession
from server.models.user import User
from server.schemas.session import RevokeResponse, SessionResponse
from server.utils.audit import log_event
from server.utils.security import decode_token

router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])


def get_current_user_and_session(
    authorization: str = Header(...), db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )

    user_id = payload.get("sub")
    session_id = payload.get("session_id")
    if not user_id or not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user or user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account locked",
        )

    session = db.query(UserSession).filter(UserSession.id == UUID(session_id)).first()
    if not session or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is inactive or revoked",
        )

    # Check inactivity timeout (15 minutes)
    now = datetime.datetime.now(datetime.timezone.utc)
    inactive_limit = datetime.timedelta(minutes=15)
    if (
        now - session.last_active_at.replace(tzinfo=datetime.timezone.utc)
        > inactive_limit
    ):
        session.is_active = False
        db.commit()
        log_event(
            event_type="SESSION_TIMEOUT",
            user_id=str(user.id),
            username=user.username,
            reason="Inactivity timeout exceeded",
            severity="INFO",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired due to inactivity",
        )

    # Update last active timestamp
    session.last_active_at = now
    db.commit()

    return user, session


@router.get("", response_model=list[SessionResponse])
def list_sessions(
    current_data=Depends(get_current_user_and_session), db: Session = Depends(get_db)
):
    user, current_session = current_data

    # Clean up expired sessions first
    now = datetime.datetime.now(datetime.timezone.utc)
    inactive_limit = datetime.timedelta(minutes=15)

    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.is_active == True)
        .all()
    )

    active_sessions = []
    for s in sessions:
        if (
            now - s.last_active_at.replace(tzinfo=datetime.timezone.utc)
            > inactive_limit
        ):
            s.is_active = False
            db.commit()
        else:
            active_sessions.append(s)

    response_data = []
    for s in active_sessions:
        response_data.append(
            SessionResponse(
                id=s.id,
                channel=s.channel,
                device_info=s.device_info,
                ip_address=s.ip_address,
                location=s.location,
                is_current=(s.id == current_session.id),
                last_active_at=s.last_active_at,
            )
        )

    return response_data


@router.post("/{id}/revoke", response_model=RevokeResponse)
def revoke_session(
    id: UUID,
    current_data=Depends(get_current_user_and_session),
    db: Session = Depends(get_db),
):
    user, current_session = current_data

    session_to_revoke = (
        db.query(UserSession)
        .filter(UserSession.id == id, UserSession.user_id == user.id)
        .first()
    )

    if not session_to_revoke:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    session_to_revoke.is_active = False
    db.commit()

    log_event(
        event_type="SESSION_REVOKED",
        user_id=str(user.id),
        username=user.username,
        details={"revoked_session_id": str(id)},
        severity="INFO",
    )

    return RevokeResponse(message="Session successfully revoked")
