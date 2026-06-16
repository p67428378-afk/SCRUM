"""
Module: kyc
Purpose: FastAPI router for KYC onboarding endpoints.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.app import crud, schemas, database

router = APIRouter(prefix="/api/kyc", tags=["KYC Onboarding"])


@router.post(
    "/onboarding",
    response_model=schemas.KYCOnboardingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit customer details for KYC onboarding"
)
def submit_kyc_onboarding(
    request: schemas.KYCOnboardingRequest,
    db: Session = Depends(database.get_db)
):
    """
    Submits customer details for KYC onboarding, triggers Aadhaar/PAN validation,
    RBI/CIBIL screening, and logs the audit trail.
    """
    if not request.cibil_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CIBIL consent is required for KYC onboarding"
        )

    try:
        kyc_request = crud.create_kyc_onboarding(db, request)
        db.commit()
        db.refresh(kyc_request)
        
        return schemas.KYCOnboardingResponse(
            id=kyc_request.id,
            customer_id=kyc_request.customer_id,
            status=kyc_request.status,
            created_at=kyc_request.created_at,
            updated_at=kyc_request.updated_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during KYC onboarding: {str(e)}"
        )


@router.get(
    "/requests",
    response_model=List[schemas.KYCRequestListItem],
    summary="Retrieve a list of KYC onboarding requests"
)
def list_kyc_requests(
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    """
    Retrieves a list of KYC onboarding requests with pagination and filtering.
    """
    try:
        requests = crud.get_kyc_requests(db, skip=skip, limit=limit, status=status_filter)
        
        result = []
        for req in requests:
            result.append(
                schemas.KYCRequestListItem(
                    id=req.id,
                    customer_name=req.customer.name if req.customer else "Unknown",
                    aadhaar_status=req.verification.aadhaar_status if req.verification else "PENDING",
                    pan_status=req.verification.pan_status if req.verification else "PENDING",
                    rbi_status=req.screening.rbi_status if req.screening else "PENDING",
                    cibil_status=req.screening.cibil_status if req.screening else "PENDING",
                    final_status=req.status,
                    created_at=req.created_at
                )
            )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/requests/{id}",
    response_model=schemas.KYCRequestDetail,
    summary="Retrieve detailed information about a specific KYC onboarding request"
)
def get_kyc_request_detail(
    id: str,
    db: Session = Depends(database.get_db)
):
    """
    Retrieves detailed information about a specific KYC onboarding request,
    including verification, screening, and audit logs.
    """
    try:
        req = crud.get_kyc_request(db, id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="KYC request not found"
            )
        
        # Map to detail schema
        customer_detail = schemas.CustomerDetail(
            id=req.customer.id,
            name=req.customer.name,
            email=req.customer.email,
            phone=req.customer.phone,
            aadhaar_number=req.customer.aadhaar_number,
            pan_number=req.customer.pan_number
        ) if req.customer else None

        verification_detail = schemas.VerificationDetail(
            id=req.verification.id,
            aadhaar_status=req.verification.aadhaar_status,
            aadhaar_response=req.verification.aadhaar_response,
            pan_status=req.verification.pan_status,
            pan_response=req.verification.pan_response
        ) if req.verification else None

        screening_detail = schemas.ScreeningDetail(
            id=req.screening.id,
            rbi_status=req.screening.rbi_status,
            rbi_response=req.screening.rbi_response,
            cibil_status=req.screening.cibil_status,
            cibil_response=req.screening.cibil_response
        ) if req.screening else None

        audit_logs_detail = [
            schemas.AuditLogDetail(
                id=log.id,
                action=log.action,
                details=log.details,
                timestamp=log.timestamp
            )
            for log in req.audit_logs
        ] if req.audit_logs else []

        return schemas.KYCRequestDetail(
            id=req.id,
            status=req.status,
            customer=customer_detail,
            verification=verification_detail,
            screening=screening_detail,
            audit_logs=audit_logs_detail,
            created_at=req.created_at,
            updated_at=req.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
