from sqlalchemy.orm import Session
from fastapi import HTTPException
from server.models import TenantConfig, Tenant
from server.schemas import TenantConfigUpdate
from server.services.audit_service import log_audit_event


def get_tenant_config(db: Session, tenant_id: str) -> TenantConfig:
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found.")

    config = db.query(TenantConfig).filter(TenantConfig.tenant_id == tenant_id).first()
    if not config:
        config = TenantConfig(
            tenant_id=tenant_id,
            rate_limit_rpm=1000,
            storage_quota_gb=50,
            feature_flags={},
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def update_tenant_config(
    db: Session, tenant_id: str, data: TenantConfigUpdate
) -> TenantConfig:
    config = get_tenant_config(db, tenant_id)

    updated_fields = {}
    if data.rate_limit_rpm is not None:
        config.rate_limit_rpm = data.rate_limit_rpm
        updated_fields["rate_limit_rpm"] = data.rate_limit_rpm
    if data.storage_quota_gb is not None:
        config.storage_quota_gb = data.storage_quota_gb
        updated_fields["storage_quota_gb"] = data.storage_quota_gb
    if data.feature_flags is not None:
        config.feature_flags = data.feature_flags
        updated_fields["feature_flags"] = data.feature_flags

    db.commit()
    db.refresh(config)

    log_audit_event(
        db=db,
        tenant_id=tenant_id,
        action="UPDATE_CONFIG",
        entity_type="TenantConfig",
        entity_id=config.id,
        details=updated_fields,
    )

    return config
