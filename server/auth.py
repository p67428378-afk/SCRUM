import bcrypt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from server.config import settings
from server.database import get_db
from server.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# In-memory failed login attempts tracker
# Format: {username: {"count": int, "locked_until": datetime}}
failed_attempts: Dict[str, dict] = {}


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user"
        )
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "admin_support", "admin_fraud"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized (requires admin role)",
        )
    return current_user


def handle_failed_login(username: str):
    now = datetime.now(timezone.utc)
    if username not in failed_attempts:
        failed_attempts[username] = {"count": 1, "locked_until": None}
    else:
        attempt = failed_attempts[username]
        if attempt["locked_until"] and now > attempt["locked_until"]:
            # Lock expired, reset
            attempt["count"] = 1
            attempt["locked_until"] = None
        else:
            attempt["count"] += 1
            if attempt["count"] >= 5:
                attempt["locked_until"] = now + timedelta(minutes=30)


def is_account_locked(username: str) -> bool:
    now = datetime.now(timezone.utc)
    if username in failed_attempts:
        attempt = failed_attempts[username]
        if attempt["locked_until"]:
            if now < attempt["locked_until"]:
                return True
            else:
                # Lock expired, reset
                attempt["locked_until"] = None
                attempt["count"] = 0
    return False


def reset_failed_login(username: str):
    if username in failed_attempts:
        failed_attempts[username] = {"count": 0, "locked_until": None}
