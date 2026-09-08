from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter()

VALID_CATEGORIES = ["Plumbing", "Electrical", "Public Maintenance"]
VALID_STATUSES = ["Open", "In Progress", "Resolved"]


@router.get("", response_model=List[schemas.ServiceRequestResponse])
def list_service_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    resident_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.ServiceRequest)

    if current_user.role == "Resident":
        # Residents only see their own tickets
        query = query.filter(models.ServiceRequest.resident_id == current_user.id)
    elif resident_id:
        query = query.filter(models.ServiceRequest.resident_id == resident_id)

    if status_filter:
        query = query.filter(models.ServiceRequest.status == status_filter)
    if category:
        query = query.filter(models.ServiceRequest.category == category)

    tickets = (
        query.order_by(models.ServiceRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return tickets


@router.post(
    "",
    response_model=schemas.ServiceRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_service_request(
    request_in: schemas.ServiceRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request_in.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Allowed categories: {VALID_CATEGORIES}",
        )

    ticket = models.ServiceRequest(
        title=request_in.title,
        category=request_in.category,
        description=request_in.description,
        status="Open",
        resident_id=current_user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{request_id}", response_model=schemas.ServiceRequestResponse)
def get_service_request(
    request_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(models.ServiceRequest)
        .filter(models.ServiceRequest.id == request_id)
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request ticket not found",
        )

    if current_user.role == "Resident" and ticket.resident_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own service requests",
        )

    return ticket


@router.patch("/{request_id}", response_model=schemas.ServiceRequestResponse)
def update_service_request(
    request_id: str,
    update_in: schemas.ServiceRequestUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(models.ServiceRequest)
        .filter(models.ServiceRequest.id == request_id)
        .first()
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request ticket not found",
        )

    # Permission check
    if current_user.role == "Resident" and ticket.resident_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this service request",
        )

    if update_in.status:
        if update_in.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed statuses: {VALID_STATUSES}",
            )
        # Residents cannot change status to Resolved or In Progress unless allowed, but Admin/Staff can
        if current_user.role == "Resident" and update_in.status != ticket.status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Admin or Staff can update ticket status",
            )

    if update_in.assigned_staff_id:
        if current_user.role not in ["Admin", "Staff"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Admin or Staff can assign tickets",
            )
        staff_user = (
            db.query(models.User)
            .filter(
                models.User.id == update_in.assigned_staff_id,
                models.User.role.in_(["Staff", "Admin"]),
            )
            .first()
        )
        if not staff_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned staff user not found or is not a Staff/Admin role",
            )

    if update_in.category and update_in.category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Allowed categories: {VALID_CATEGORIES}",
        )

    for field, value in update_in.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)
    return ticket
