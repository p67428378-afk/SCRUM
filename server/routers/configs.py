from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import TenantConfigResponse, TenantConfigUpdate
from server.services import config_service
from server.middleware.tenant_context import get_tenant_context

router = APIRouter(prefix="/api/v1/tenants", tags=["Tenant Config & Quotas"])


@router.get("/{tenant_id}/config", response_model=TenantConfigResponse)
def get_tenant_config(
    tenant_id: str,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return config_service.get_tenant_config(db, tenant_id)


@router.put("/{tenant_id}/config", response_model=TenantConfigResponse)
def update_tenant_config(
    tenant_id: str,
    data: TenantConfigUpdate,
    db: Session = Depends(get_db),
    tenant_ctx=Depends(get_tenant_context),
):
    return config_service.update_tenant_config(db, tenant_id, data)
