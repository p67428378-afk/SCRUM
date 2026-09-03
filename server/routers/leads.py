from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ConsultationLead, DesignPost
from server.schemas import (
    LeadCreate,
    LeadStatusUpdate,
    LeadResponse,
)
from server.auth import get_current_user

router = APIRouter(prefix="/leads", tags=["Consultation Leads"])


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
):
    designer = db.query(User).filter(User.id == lead_in.designer_id).first()
    if not designer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Designer with ID '{lead_in.designer_id}' not found.",
        )

    if lead_in.post_id:
        post = db.query(DesignPost).filter(DesignPost.id == lead_in.post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referenced design post '{lead_in.post_id}' not found.",
            )

    lead = ConsultationLead(
        designer_id=lead_in.designer_id,
        post_id=lead_in.post_id,
        client_name=lead_in.client_name,
        client_email=lead_in.client_email,
        client_phone=lead_in.client_phone,
        cafe_location=lead_in.cafe_location,
        estimated_budget=lead_in.estimated_budget,
        project_timeline=lead_in.project_timeline,
        message=lead_in.message,
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)


@router.get("", response_model=List[LeadResponse])
def get_leads(
    lead_status: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (new, in_review, contacted, closed)",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ConsultationLead)

    if current_user.role == "designer":
        query = query.filter(ConsultationLead.designer_id == current_user.id)
    elif current_user.role == "admin":
        pass  # Admin sees all leads
    else:
        # Owner / client sees leads they submitted
        query = query.filter(ConsultationLead.client_email == current_user.email)

    if lead_status:
        query = query.filter(ConsultationLead.status == lead_status)

    leads = query.order_by(ConsultationLead.created_at.desc()).all()
    return [LeadResponse.model_validate(l) for l in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(ConsultationLead).filter(ConsultationLead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation lead '{lead_id}' not found.",
        )

    if (
        current_user.role != "admin"
        and lead.designer_id != current_user.id
        and lead.client_email != current_user.email
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this consultation lead.",
        )

    return LeadResponse.model_validate(lead)


@router.patch("/{lead_id}/status", response_model=LeadResponse)
@router.put("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: str,
    status_in: LeadStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lead = db.query(ConsultationLead).filter(ConsultationLead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation lead '{lead_id}' not found.",
        )

    if current_user.role != "admin" and lead.designer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiving designer or an administrator can update lead status.",
        )

    valid_statuses = ["new", "in_review", "contacted", "closed", "archived"]
    if status_in.status.lower() not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_in.status}'. Allowed: {valid_statuses}",
        )

    lead.status = status_in.status.lower()
    db.commit()
    db.refresh(lead)
    return LeadResponse.model_validate(lead)
