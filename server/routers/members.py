import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from server.database import get_db, get_password_hash
from server.models import Member, User
from server.schemas import MemberCreate, MemberUpdate, MemberResponse
from server.routers.auth import get_current_user, require_staff_or_admin

router = APIRouter(prefix="/api/v1/members", tags=["members"])


@router.get("", response_model=List[MemberResponse])
def list_members(
    search: Optional[str] = Query(None, description="Search member name or email"),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    q = db.query(Member).join(User)
    if search:
        s = f"%{search}%"
        q = q.filter((User.full_name.ilike(s)) | (User.email.ilike(s)))
    if status_filter:
        q = q.filter(Member.status == status_filter.upper())

    members = q.offset(skip).limit(limit).all()
    return members


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID '{member_id}' not found",
        )

    # Check authorization: Staff/Admin or the member themselves
    user_role = (current_user.role or "").upper()
    if user_role not in ["STAFF", "ADMIN"] and current_user.id != member.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only view your own member profile",
        )

    return member


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member_in: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    existing_user = db.query(User).filter(User.email == member_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    tier = (member_in.membership_tier or "STANDARD").upper()
    if tier not in ["STANDARD", "PREMIUM"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership tier must be either STANDARD or PREMIUM",
        )

    pwd = member_in.password or "testpassword"
    new_user = User(
        id=str(uuid.uuid4()),
        email=member_in.email,
        hashed_password=get_password_hash(pwd),
        full_name=member_in.full_name,
        phone=member_in.phone,
        role="PATRON",
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_member = Member(
        id=str(uuid.uuid4()),
        user_id=new_user.id,
        membership_tier=tier,
        status="ACTIVE",
        unpaid_fines=0.0,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: str,
    member_in: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with ID '{member_id}' not found",
        )

    if member_in.membership_tier is not None:
        tier = member_in.membership_tier.upper()
        if tier not in ["STANDARD", "PREMIUM"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Membership tier must be either STANDARD or PREMIUM",
            )
        member.membership_tier = tier

    if member_in.status is not None:
        new_status = member_in.status.upper()
        if new_status not in ["ACTIVE", "SUSPENDED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either ACTIVE or SUSPENDED",
            )
        member.status = new_status

    if member_in.phone is not None and member.user:
        member.user.phone = member_in.phone

    db.commit()
    db.refresh(member)
    return member
