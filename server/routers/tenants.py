from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import TenantCreate, TenantResponse, TenantUpdateStatus
from server.services import tenant_service
from server.middleware.tenant_context import get_tenant_context

router = APIRouter(prefix="/api/v1/tenants", tags=["Tenants"])


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
def onboard_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return tenant_service.onboard_tenant(db, data)


@router.get("", response_model=List[TenantResponse])
def list_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return tenant_service.list_tenants(db, skip=skip, limit=limit, status=status)


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant_details(
    tenant_id: str,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return tenant_service.get_tenant_details(db, tenant_id)


@router.patch("/{tenant_id}/status", response_model=TenantResponse)
def update_tenant_status(
    tenant_id: str,
    data: TenantUpdateStatus,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return tenant_service.update_tenant_status(db, tenant_id, data.status)
