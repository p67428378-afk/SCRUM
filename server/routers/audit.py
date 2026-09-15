from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import AuditLogResponse
from server.services import audit_service
from server.middleware.tenant_context import get_tenant_context

router = APIRouter(prefix="/api/v1/tenants", tags=["Audit Logs"])


@router.get("/{tenant_id}/audit-logs", response_model=List[AuditLogResponse])
def get_tenant_audit_logs(
    tenant_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return audit_service.get_tenant_audit_logs(db, tenant_id, skip=skip, limit=limit)
