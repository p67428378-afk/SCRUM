import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.database import get_db
from server.models import User, ConsultationLead, DesignPost
from server.schemas import (
    LeadCreate,
    LeadStatusUpdate,
    LeadOut,
    LeadListResponse,
)
from server.auth import require_designer_role

router = APIRouter(prefix="/leads", tags=["Consultation & Leads"])


def format_lead_out(lead: ConsultationLead) -> LeadOut:
    post_title = lead.post.title if lead.post else None
    return LeadOut(
        id=lead.id,
        designer_id=lead.designer_id,
        post_id=lead.post_id,
        post_title=post_title,
        client_name=lead.client_name,
        client_email=lead.client_email,
        client_phone=lead.client_phone,
        cafe_location=lead.cafe_location,
        estimated_budget=lead.estimated_budget,
        project_timeline=lead.project_timeline,
        message=lead.message,
        status=lead.status,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def submit_consultation_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
):
    """Submit a consultation inquiry to a designer. Validates email or phone contact requirement."""
    # Business rule: Must provide valid email or phone
    has_email = bool(payload.client_email and str(payload.client_email).strip())
    has_phone = bool(payload.client_phone and str(payload.client_phone).strip())

    if not has_email and not has_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact information missing: Please provide either a valid email address or phone number.",
        )

    # Validate designer exists
    designer = db.query(User).filter(User.id == payload.designer_id).first()
    if not designer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target designer not found",
        )

    # Validate post if provided
    if payload.post_id:
        post = db.query(DesignPost).filter(DesignPost.id == payload.post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced design post not found",
            )

    lead = ConsultationLead(
        id=str(uuid.uuid4()),
        designer_id=payload.designer_id,
        post_id=payload.post_id,
        client_name=payload.client_name.strip(),
        client_email=str(payload.client_email).strip()
        if payload.client_email
        else None,
        client_phone=payload.client_phone.strip() if payload.client_phone else None,
        cafe_location=payload.cafe_location.strip(),
        estimated_budget=payload.estimated_budget.strip(),
        project_timeline=payload.project_timeline.strip(),
        message=payload.message.strip(),
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    return format_lead_out(lead)


@router.get("", response_model=LeadListResponse)
def list_designer_leads(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status ('new', 'in_review', 'contacted', 'closed')",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """List consultation leads received by the logged-in interior designer."""
    query = db.query(ConsultationLead)

    # If admin, can view all leads or filter by designer
    if current_user.role != "admin":
        query = query.filter(ConsultationLead.designer_id == current_user.id)

    if status_filter:
        query = query.filter(ConsultationLead.status == status_filter.lower().strip())

    total = query.count()
    leads = (
        query.order_by(desc(ConsultationLead.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    items = [format_lead_out(lead) for lead in leads]

    return LeadListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=LeadOut)
def get_lead_details(
    id: str,
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific consultation lead."""
    lead = db.query(ConsultationLead).filter(ConsultationLead.id == id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation lead not found",
        )

    if lead.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this lead",
        )

    return format_lead_out(lead)


@router.patch("/{id}/status", response_model=LeadOut)
def update_lead_status(
    id: str,
    payload: LeadStatusUpdate,
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """Update status of a consultation lead (e.g. 'new' -> 'in_review' -> 'contacted' -> 'closed')."""
    lead = db.query(ConsultationLead).filter(ConsultationLead.id == id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation lead not found",
        )

    if lead.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this lead",
        )

    lead.status = payload.status
    db.commit()
    db.refresh(lead)

    return format_lead_out(lead)
