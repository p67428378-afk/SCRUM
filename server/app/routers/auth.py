from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pyotp
from server.app.database import get_db
from server.app.models import Student
from server.app.schemas import LoginRequest, LoginResponse, LogoutResponse
from server.app.auth import verify_password, create_access_token, get_current_student

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.email == request.email).first()
    if not student or not verify_password(request.password, str(student.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if student.mfa_secret:
        if not request.mfa_code:
            return LoginResponse(
                access_token="", token_type="bearer", mfa_required=True
            )

        totp = pyotp.TOTP(str(student.mfa_secret))
        if not totp.verify(request.mfa_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MFA code"
            )

    access_token = create_access_token(data={"sub": student.email})
    return LoginResponse(
        access_token=access_token, token_type="bearer", mfa_required=False
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(current_student: Student = Depends(get_current_student)):
    return LogoutResponse(message="Successfully logged out")
