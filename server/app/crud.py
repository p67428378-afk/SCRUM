"""
Module: crud
Purpose: Database CRUD operations for KYC onboarding.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from server.app import models, schemas
from server.app.services import uidai, nsdl, rbi, cibil


def get_kyc_request(db: Session, kyc_request_id: str) -> Optional[models.KYCRequest]:
    """
    Retrieves a specific KYC request by ID with eager loading of relationships.
    """
    return (
        db.query(models.KYCRequest)
        .options(
            joinedload(models.KYCRequest.customer),
            joinedload(models.KYCRequest.verification),
            joinedload(models.KYCRequest.screening),
            joinedload(models.KYCRequest.audit_logs)
        )
        .filter(models.KYCRequest.id == kyc_request_id)
        .first()
    )


def get_kyc_requests(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None
) -> List[models.KYCRequest]:
    """
    Retrieves a list of KYC requests with pagination and filtering.
    """
    query = db.query(models.KYCRequest).options(
        joinedload(models.KYCRequest.customer),
        joinedload(models.KYCRequest.verification),
        joinedload(models.KYCRequest.screening)
    )
    if status:
        query = query.filter(models.KYCRequest.status == status)
    
    # Always order by created_at to ensure deterministic results
    return query.order_by(models.KYCRequest.created_at.desc()).offset(skip).limit(limit).all()


def create_kyc_onboarding(db: Session, request: schemas.KYCOnboardingRequest) -> models.KYCRequest:
    """
    Creates a new KYC onboarding request, performs validations/screenings,
    logs audit trails, and saves everything in a single transaction.
    """
    # 1. Create Customer
    customer = models.Customer(
        name=request.name,
        email=request.email,
        phone=request.phone,
        aadhaar_number=request.aadhaar_number,
        pan_number=request.pan_number
    )
    db.add(customer)
    db.flush()  # Get customer.id

    # 2. Create KYC Request
    kyc_request = models.KYCRequest(
        customer_id=customer.id,
        status="PENDING"
    )
    db.add(kyc_request)
    db.flush()  # Get kyc_request.id

    # 3. Perform Aadhaar Validation
    aadhaar_res = uidai.validate_aadhaar(request.aadhaar_number)
    aadhaar_status = aadhaar_res["status"]
    
    # 4. Perform PAN Validation
    pan_res = nsdl.validate_pan(request.pan_number)
    pan_status = pan_res["status"]

    # Create Verification record
    verification = models.Verification(
        kyc_request_id=kyc_request.id,
        aadhaar_status=aadhaar_status,
        aadhaar_response=aadhaar_res["response"],
        pan_status=pan_status,
        pan_response=pan_res["response"]
    )
    db.add(verification)

    # 5. Perform RBI Screening
    rbi_res = rbi.screen_rbi(request.name)
    rbi_status = rbi_res["status"]

    # 6. Perform CIBIL Screening
    cibil_res = cibil.screen_cibil(request.name, request.cibil_consent)
    cibil_status = cibil_res["status"]

    # Create Screening record
    screening = models.Screening(
        kyc_request_id=kyc_request.id,
        rbi_status=rbi_status,
        rbi_response=rbi_res["response"],
        cibil_status=cibil_status,
        cibil_response=cibil_res["response"]
    )
    db.add(screening)

    # 7. Determine Final Status
    if (
        aadhaar_status == "VERIFIED"
        and pan_status == "VERIFIED"
        and rbi_status == "CLEARED"
        and cibil_status == "CLEARED"
    ):
        kyc_request.status = "APPROVED"
    else:
        kyc_request.status = "FLAGGED"

    # 8. Log Audit Trails
    audit_logs = [
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="CUSTOMER_CREATED",
            details=f"Customer record created for {request.name}."
        ),
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="AADHAAR_VALIDATION",
            details=f"Aadhaar validation completed with status: {aadhaar_status}."
        ),
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="PAN_VALIDATION",
            details=f"PAN validation completed with status: {pan_status}."
        ),
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="RBI_SCREENING",
            details=f"RBI sanctions screening completed with status: {rbi_status}."
        ),
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="CIBIL_SCREENING",
            details=f"CIBIL fraud registry screening completed with status: {cibil_status}."
        ),
        models.AuditLog(
            kyc_request_id=kyc_request.id,
            action="STATUS_ASSIGNED",
            details=f"KYC request status assigned: {kyc_request.status}."
        )
    ]
    for log in audit_logs:
        db.add(log)

    return kyc_request
